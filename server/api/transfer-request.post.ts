import { createClient } from '@supabase/supabase-js';
import { getRequestIP, readBody, setResponseHeader } from 'h3';
import type { Database } from '~/types/database.types';
import { APP_SETTING_KEYS, parseAppSettings } from '../../shared/utils/appSettings';
import { isTransferRequestRateLimited } from '../utils/transferRequestRateLimit';
import {
  processTransferRequest,
  TransferRequestError,
} from '../utils/transferRequestService';
import { sendTransferRequestEmails } from '../utils/transferRequestEmail';
import { assertOnlineTransferRequestsEnabled } from '../utils/onlineTransferRequests';

type TransferRequestRpcClient = {
  rpc: (
    functionName: 'save_transfer_request',
    args: Record<string, unknown>,
  ) => Promise<{
    data: {
      transfer_request_id: number;
      drafted_team_id: number;
      target_gameweek: number;
    } | null;
    error: { message: string } | null;
  }>;
};

const getTransferRequestValidationMessage = (message: string) => {
  const knownMessages = [
    'A transfer request is already pending for this team',
    'Transfer request not found',
    'Transfer request deadline has passed',
    'No eligible transfer team found',
    'Invalid target gameweek',
    'A transfer request must contain one or two transfers',
    'A player can only be included once in a transfer request',
    'One or more selected players could not be found for this team',
    'Incoming players must play in the same position as the outgoing player',
    'Incoming players are unavailable for the season',
    'Selected player details do not match the current player data',
    'Incoming players must not already be in the selected team',
    'The requested transfers exceed the team budget',
    'This team has already used its two transfers before 1 January',
    'This team has already used its two transfers after 1 January',
    'This team has already used its four transfers for the season',
  ];

  return knownMessages.find(knownMessage => message.includes(knownMessage));
};

export default defineEventHandler(async (event) => {
  await assertOnlineTransferRequestsEnabled();
  const requesterIP = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown';

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new TransferRequestError(500, 'Server configuration error');
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    const rpcClient = supabase as unknown as TransferRequestRpcClient;

    return await processTransferRequest(await readBody(event), {
      isRateLimited: () => isTransferRequestRateLimited(requesterIP),
      loadRequestSettings: async () => {
        const { data, error } = await supabase
          .from('settings')
          .select('setting_key, setting_value')
          .in('setting_key', APP_SETTING_KEYS);

        if (error) throw new TransferRequestError(500, 'Failed to load transfer settings');

        try {
          const settings = parseAppSettings(data ?? []);
          return {
            activeSeason: settings.activeSeason,
            currentGameweek: settings.currentGameweek,
          };
        }
        catch {
          throw new TransferRequestError(500, 'Transfer settings are invalid');
        }
      },
      saveRequest: async (request, targetGameweek, activeSeason, teamKey, pendingRequestId) => {
        const { data: team, error: teamError } = await supabase
          .from('drafted_teams')
          .select('drafted_team_id, team_name, active_season, allowed_transfers')
          .eq('key', teamKey)
          .eq('active_season', activeSeason)
          .maybeSingle();

        if (teamError || !team || !team.allowed_transfers) {
          throw new TransferRequestError(422, 'Unable to submit transfer request');
        }
        const { data, error } = await rpcClient.rpc('save_transfer_request', {
          p_active_season: activeSeason,
          p_drafted_team_id: team.drafted_team_id,
          p_team_name: team.team_name,
          p_team_key: teamKey,
          p_requester_name: request.requesterName,
          p_requester_email: request.requesterEmail,
          p_target_gameweek: targetGameweek,
          p_transfer_request_id: pendingRequestId,
          p_items: [
            {
              transfer_number: 1,
              drafted_player_id: request.firstPlayerOutId,
              player_id: request.firstPlayerInId,
              player_out: request.firstPlayerOut,
              player_in: request.firstPlayerIn,
            },
            ...(request.secondPlayerOut && request.secondPlayerIn
              ? [{
                  transfer_number: 2,
                  drafted_player_id: request.secondPlayerOutId,
                  player_id: request.secondPlayerInId,
                  player_out: request.secondPlayerOut,
                  player_in: request.secondPlayerIn,
                }]
              : []),
          ],
        });

        const validationMessage = error?.message
          ? getTransferRequestValidationMessage(error.message)
          : undefined;

        if (
          validationMessage === 'A transfer request is already pending for this team'
          || validationMessage === 'No eligible transfer team found'
        ) {
          // Do not confirm that a team has a pending request to an unauthenticated
          // caller. The database still rejects the duplicate atomically.
          throw new TransferRequestError(422, 'Unable to submit transfer request');
        }
        if (validationMessage === 'Transfer request not found') {
          throw new TransferRequestError(409, 'This transfer request has changed. Refresh the page and try again.');
        }
        if (validationMessage) {
          throw new TransferRequestError(422, validationMessage);
        }
        if (error || !data) throw new Error(error?.message ?? 'Request was not saved');

        return {
          transferRequestId: data.transfer_request_id,
          teamId: data.drafted_team_id,
          teamName: team.team_name,
          targetGameweek: data.target_gameweek,
        };
      },
      sendEmail: async (request) => {
        return sendTransferRequestEmails(event, request);
      },
      verifyTurnstile: async token => (await verifyTurnstileToken(token, event)).success,
    });
  }
  catch (error) {
    if (error instanceof TransferRequestError) {
      if (error.statusCode === 429) {
        setResponseHeader(event, 'Retry-After', 900);
      }
      throw createError({ statusCode: error.statusCode, statusMessage: error.message });
    }

    throw createError({ statusCode: 422, statusMessage: 'Invalid transfer request' });
  }
});
