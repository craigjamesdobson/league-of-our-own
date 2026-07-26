import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import {
  parseTeamSubmissionRequest,
  validateSubmissionPlayers,
} from '../utils/teamSubmission';

interface SavedTeam {
  drafted_team_id: number;
  key: string;
  edited_count: number;
  active_season: string;
  team_name: string;
  team_owner: string;
  team_email: string;
  contact_number: string | null;
  allow_communication: boolean;
  allowed_transfers: boolean;
  total_team_value: number;
  created_at: string;
  updated_at: string | null;
}

type SubmissionRpcClient = {
  rpc: (
    functionName: 'save_team_submission',
    args: Record<string, unknown>,
  ) => Promise<{ data: SavedTeam | null; error: { message: string } | null }>;
};

export default defineEventHandler(async (event) => {
  try {
    const submission = parseTeamSubmissionRequest(await readBody(event));
    const turnstileResult = await verifyTurnstileToken(submission.turnstileToken);

    if (!turnstileResult.success) {
      throw createError({ statusCode: 422, statusMessage: 'Security verification failed' });
    }

    const config = useRuntimeConfig(event);
    if (config.public.TEAM_REGISTRATION_OPEN === false) {
      throw createError({ statusCode: 403, statusMessage: 'Team registration is closed' });
    }

    const activeSeason = String(config.public.ACTIVE_SEASON || '');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!activeSeason || !supabaseUrl || !supabaseServiceKey) {
      throw createError({ statusCode: 500, statusMessage: 'Server configuration error' });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    const { data: players, error: playerError } = await supabase
      .from('players_view')
      .select('player_id, position, cost, unavailable_for_season')
      .in('player_id', submission.playerIds);

    if (playerError) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to validate players' });
    }

    const totalTeamValue = validateSubmissionPlayers(players ?? [], submission.allowedTransfers);
    const rpcClient = supabase as unknown as SubmissionRpcClient;
    const { data: savedTeam, error: saveError } = await rpcClient.rpc('save_team_submission', {
      p_active_season: activeSeason,
      p_allow_communication: submission.allowCommunication,
      p_allowed_transfers: submission.allowedTransfers,
      p_contact_number: submission.contactNumber,
      p_edit_key: submission.editKey,
      p_player_ids: submission.playerIds,
      p_team_email: submission.teamEmail,
      p_team_name: submission.teamName,
      p_team_owner: submission.teamOwner,
      p_total_team_value: totalTeamValue,
    });

    if (saveError || !savedTeam) {
      const isMissingTeam = saveError?.message.includes('No editable team found');
      throw createError({
        statusCode: isMissingTeam ? 404 : 500,
        statusMessage: isMissingTeam ? 'No editable team found' : 'Failed to save team',
      });
    }

    return savedTeam;
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 422,
      statusMessage: error instanceof Error ? error.message : 'Invalid team submission',
    });
  }
});
