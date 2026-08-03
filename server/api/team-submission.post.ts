import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import {
  processTeamSubmission,
  type SavedTeam,
  type SaveTeamSubmission,
  type SaveTeamResult,
  TeamSubmissionError,
} from '../utils/teamSubmissionService';
import {
  sendCreatedTeamEmails,
} from '../utils/teamSubmissionEmail';
import { APP_SETTING_KEYS, parseAppSettings } from '../../shared/utils/appSettings';

type SubmissionRpcClient = {
  rpc: (
    functionName: 'save_team_submission',
    args: Record<string, unknown>,
  ) => Promise<{
    data: SavedTeam | null;
    error: { code?: string; details?: string; message: string } | null;
  }>;
};

const EMAIL_UNIQUE_INDEX = 'drafted_teams_season_email_unique';
const NAME_UNIQUE_INDEX = 'drafted_teams_season_name_unique';

const violatesConstraint = (
  error: { code?: string; details?: string; message: string },
  constraint: string,
) => error.code === '23505'
  && `${error.message} ${error.details ?? ''}`.includes(constraint);

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
          teamSubmissionDeadline: settings.teamSubmissionDeadline,
        };
      },
      verifyTurnstile: async (token) => {
        const result = await verifyTurnstileToken(token);
        return result.success;
      },
      loadPlayers: async (playerIds) => {
        const { data, error } = await supabase
          .from('players_view')
          .select('player_id, position, cost, unavailable_for_season, web_name')
          .in('player_id', playerIds);

        if (error) {
          throw new TeamSubmissionError(500, 'Failed to validate players');
        }

        return data ?? [];
      },
      saveTeam: async (submission: SaveTeamSubmission): Promise<SaveTeamResult> => {
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

        if (error && violatesConstraint(error, EMAIL_UNIQUE_INDEX)) {
          if (submission.editKey) {
            throw new TeamSubmissionError(409, 'Another team already uses this email address');
          }
          return { outcome: 'existing-email' };
        }

        if (error?.message.includes('Team registration is closed')) {
          throw new TeamSubmissionError(403, 'Team registration is closed');
        }

        if (error && violatesConstraint(error, NAME_UNIQUE_INDEX)) {
          throw new TeamSubmissionError(409, 'That team name is already in use for this season');
        }

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

        return {
          outcome: submission.editKey ? 'updated' : 'created',
          team: data,
        };
      },
      sendCreatedTeamEmails: async (team, players) => await sendCreatedTeamEmails(event, team, players),
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
