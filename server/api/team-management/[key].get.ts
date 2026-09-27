import { createClient } from '@supabase/supabase-js';
import type { Database, Tables } from '~/types/database.types';
import type { DraftedPlayerWithWeeklyStats } from '~/types/DraftedPlayer';
import type { TransferRequest } from '~/types/TransferRequest';
import { APP_SETTING_KEYS, parseAppSettings } from '../../../shared/utils/appSettings';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ManagementTeamPlayer = {
  drafted_player_id: number;
  drafted_team: number | null;
  data: Tables<'players_view'>;
};

type ManagementTeam = Omit<Tables<'drafted_teams'>, 'key'> & {
  players: DraftedPlayerWithWeeklyStats[];
};

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key');

  if (!key || !UUID_PATTERN.test(key)) {
    throw createError({ statusCode: 404, statusMessage: 'No team found' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error' });
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  const { data: settingsData, error: settingsError } = await supabase
    .from('settings')
    .select('setting_key, setting_value')
    .in('setting_key', APP_SETTING_KEYS);

  if (settingsError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load application settings' });
  }

  let settings;
  try {
    settings = parseAppSettings(settingsData ?? []);
  }
  catch {
    throw createError({ statusCode: 500, statusMessage: 'Application settings are invalid' });
  }

  const { data: teamData, error: teamError } = await supabase
    .from('drafted_teams')
    .select(`
      drafted_team_id,
      team_name,
      team_owner,
      team_email,
      allowed_transfers,
      active_season,
      created_at,
      updated_at,
      allow_communication,
      contact_number,
      edited_count,
      total_team_value,
      players:drafted_players(
        drafted_player_id,
        drafted_team,
        data:players_view(*)
      )
    `)
    .eq('key', key)
    .eq('active_season', settings.activeSeason)
    .maybeSingle();

  if (teamError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load team' });
  }

  if (!teamData) {
    throw createError({ statusCode: 404, statusMessage: 'No team found' });
  }

  const rawTeam = teamData as unknown as Omit<ManagementTeam, 'players'> & {
    players: ManagementTeamPlayer[];
  };
  const draftedPlayerIds = rawTeam.players.map(player => player.drafted_player_id);

  const { data: transferRows, error: transfersError } = draftedPlayerIds.length
    ? await supabase
        .from('drafted_transfers')
        .select('drafted_transfer_id, transfer_week, created_at, drafted_player, player_id')
        .in('drafted_player', draftedPlayerIds)
        .order('transfer_week', { ascending: true })
    : { data: [], error: null };

  if (transfersError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load team transfers' });
  }

  const transferPlayerIds = [...new Set((transferRows ?? []).map(transfer => transfer.player_id))];
  const { data: transferPlayers, error: transferPlayersError } = transferPlayerIds.length
    ? await supabase
        .from('players_view')
        .select('*')
        .in('player_id', transferPlayerIds)
    : { data: [], error: null };

  if (transferPlayersError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load transfer players' });
  }

  const transferPlayerById = new Map(
    (transferPlayers ?? []).map(player => [player.player_id, player]),
  );
  const transfersByDraftedPlayer = new Map<number, DraftedPlayerWithWeeklyStats['transfers']>();

  (transferRows ?? []).forEach((transfer) => {
    if (transfer.drafted_player === null || transfer.player_id === null || transfer.transfer_week === null) return;

    const player = transferPlayerById.get(transfer.player_id);
    if (!player) return;

    const currentTransfers = transfersByDraftedPlayer.get(transfer.drafted_player) ?? [];
    currentTransfers.push({
      drafted_transfer_id: transfer.drafted_transfer_id,
      transfer_week: transfer.transfer_week,
      created_at: transfer.created_at ?? undefined,
      data: player,
      selected: false,
    });
    transfersByDraftedPlayer.set(transfer.drafted_player, currentTransfers);
  });

  const team: ManagementTeam = {
    ...rawTeam,
    players: rawTeam.players.map(player => ({
      ...player,
      transfers: transfersByDraftedPlayer.get(player.drafted_player_id) ?? [],
    })),
  };
  const { data: pendingRequest, error: requestError } = await supabase
    .from('transfer_requests')
    .select('*')
    .eq('drafted_team_id', team.drafted_team_id)
    .eq('active_season', settings.activeSeason)
    .eq('status', 'pending')
    .maybeSingle();

  if (requestError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load transfer request' });
  }

  let requestWithItems: TransferRequest | null = null;
  if (pendingRequest) {
    const { data: items, error: itemsError } = await supabase
      .from('transfer_request_items')
      .select('*')
      .eq('transfer_request_id', pendingRequest.transfer_request_id)
      .order('transfer_number', { ascending: true });

    if (itemsError) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to load transfer request details' });
    }

    requestWithItems = {
      ...pendingRequest,
      items: items ?? [],
    };
  }

  return {
    team,
    pendingRequest: requestWithItems,
    currentGameweek: settings.currentGameweek,
    targetGameweek: settings.currentGameweek < 38 ? settings.currentGameweek + 1 : null,
    canEditPendingRequest: Boolean(
      requestWithItems && requestWithItems.target_gameweek > settings.currentGameweek,
    ),
  };
});
