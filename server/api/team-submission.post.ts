import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import {
  processTeamSubmission,
  type SavedTeam,
  type SaveTeamSubmission,
  TeamSubmissionError,
} from '../utils/teamSubmissionService';
import { APP_SETTING_KEYS, parseAppSettings } from '../../shared/utils/appSettings';

type SubmissionRpcClient = {
  rpc: (
    functionName: 'save_team_submission',
    args: Record<string, unknown>,
  ) => Promise<{ data: SavedTeam | null; error: { message: string } | null }>;
};

export default defineEventHandler(async (event) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({ statusCode: 500, statusMessage: 'Server configuration error' });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    const rpcClient = supabase as unknown as SubmissionRpcClient;

    return await processTeamSubmission(await readBody(event), {
      loadAppSettings: async () => {
        const { data, error } = await supabase
          .from('settings')
          .select('setting_key, setting_value')
          .in('setting_key', APP_SETTING_KEYS);

        if (error) {
          throw new TeamSubmissionError(500, 'Failed to load application settings');
        }

        let settings;
        try {
          settings = parseAppSettings(data ?? []);
        }
        catch {
          throw new TeamSubmissionError(500, 'Application settings are invalid');
        }
        return {
          activeSeason: settings.activeSeason,
          teamRegistrationOpen: settings.teamRegistrationOpen,
        };
      },
      verifyTurnstile: async (token) => {
        const result = await verifyTurnstileToken(token);
        return result.success;
      },
      loadPlayers: async (playerIds) => {
        const { data, error } = await supabase
          .from('players_view')
          .select('player_id, position, cost, unavailable_for_season')
          .in('player_id', playerIds);

        if (error) {
          throw new TeamSubmissionError(500, 'Failed to validate players');
        }

        return data ?? [];
      },
      saveTeam: async (submission: SaveTeamSubmission) => {
        const { data, error } = await rpcClient.rpc('save_team_submission', {
          p_active_season: submission.activeSeason,
          p_allow_communication: submission.allowCommunication,
          p_allowed_transfers: submission.allowedTransfers,
          p_contact_number: submission.contactNumber,
          p_edit_key: submission.editKey,
          p_player_ids: submission.playerIds,
          p_team_email: submission.teamEmail,
          p_team_name: submission.teamName,
          p_team_owner: submission.teamOwner,
          p_total_team_value: submission.totalTeamValue,
        });

        if (error || !data) {
          if (error) {
            console.error('[team-submission] save_team_submission failed:', error.message);
          }
          else if (!data) {
            console.error('[team-submission] save_team_submission returned no saved team');
          }
          const isMissingTeam = error?.message.includes('No editable team found');
          throw new TeamSubmissionError(
            isMissingTeam ? 404 : 500,
            isMissingTeam ? 'No editable team found' : 'Failed to save team',
          );
        }

        return data;
      },
    });
  }
  catch (error) {
    if (error instanceof TeamSubmissionError) {
      throw createError({ statusCode: error.statusCode, statusMessage: error.message });
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 422,
      statusMessage: error instanceof Error ? error.message : 'Invalid team submission',
    });
  }
});
