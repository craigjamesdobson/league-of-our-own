import { defineStore } from 'pinia';
import type {
  Player,
  PlayerInsertData,
  PlayerPreviousSeasonStatistics,
  PlayerSeasonStatistics,
  PlayerWithSeasonStatistics,
} from '~/types/Player';
import type { Database, Tables } from '~/types/database.types';

type PlayerStatisticRow = Pick<Tables<'player_statistics'>, 'player_id' | 'goals' | 'assists' | 'clean_sheet' | 'red_card' | 'points'>;
type PreviousSeasonStatisticRow = Pick<Tables<'player_previous_season_statistics'>, 'player_id' | 'goals' | 'assists' | 'clean_sheets' | 'red_cards' | 'points' | 'minutes'>;
type Club = Pick<Tables<'teams'>, 'id' | 'name' | 'short_name'>;

const emptyPlayerSeasonStatistics = (): PlayerSeasonStatistics => ({
  season_goals: 0,
  season_assists: 0,
  season_clean_sheets: 0,
  season_red_cards: 0,
  season_points: 0,
});

const emptyPreviousSeasonStatistics = (playerId: number): PlayerPreviousSeasonStatistics => ({
  player_id: playerId,
  previous_season_goals: 0,
  previous_season_assists: 0,
  previous_season_clean_sheets: 0,
  previous_season_red_cards: 0,
  previous_season_points: 0,
  previous_season_minutes: 0,
});

const aggregatePlayerStatistics = (playerStatistics: PlayerStatisticRow[]) => {
  return playerStatistics.reduce((totals, statistic) => {
    const current = totals.get(statistic.player_id) ?? emptyPlayerSeasonStatistics();

    totals.set(statistic.player_id, {
      season_goals: current.season_goals + (statistic.goals ?? 0),
      season_assists: current.season_assists + (statistic.assists ?? 0),
      season_clean_sheets: current.season_clean_sheets + (statistic.clean_sheet ? 1 : 0),
      season_red_cards: current.season_red_cards + (statistic.red_card ? 1 : 0),
      season_points: current.season_points + (statistic.points ?? 0),
    });

    return totals;
  }, new Map<number, PlayerSeasonStatistics>());
};

const mapPreviousSeasonStatistics = (
  statistics: PreviousSeasonStatisticRow[],
): PlayerPreviousSeasonStatistics[] => statistics.map(statisticsRow => ({
  player_id: statisticsRow.player_id,
  previous_season_goals: statisticsRow.goals,
  previous_season_assists: statisticsRow.assists,
  previous_season_clean_sheets: statisticsRow.clean_sheets,
  previous_season_red_cards: statisticsRow.red_cards,
  previous_season_points: statisticsRow.points,
  previous_season_minutes: statisticsRow.minutes,
}));

const mergePlayersWithSeasonStatistics = (
  players: Player[],
  playerStatistics: PlayerStatisticRow[],
  previousSeasonStatistics: PlayerPreviousSeasonStatistics[] = [],
): PlayerWithSeasonStatistics[] => {
  const statisticsByPlayerId = aggregatePlayerStatistics(playerStatistics);
  const previousSeasonStatisticsByPlayerId = new Map(
    previousSeasonStatistics.map(statistics => [statistics.player_id, statistics]),
  );

  return players.map(player => ({
    ...player,
    ...(statisticsByPlayerId.get(player.player_id) ?? emptyPlayerSeasonStatistics()),
    ...(previousSeasonStatisticsByPlayerId.get(player.player_id) ?? emptyPreviousSeasonStatistics(player.player_id)),
  }));
};

export const usePlayerStore = defineStore('player-store', () => {
  const players: Ref<PlayerWithSeasonStatistics[]> = ref([]);
  const clubs: Ref<Club[]> = ref([]);
  const playerDataLastSyncedAt: Ref<string | null> = ref(null);
  const isLoaded = ref(false);

  const fetchPlayers = async () => {
    const supabase = useSupabaseClient<Database>();
    try {
      const [
        { data: playerData, error: playerError },
        { data: playerStatisticsData, error: playerStatisticsError },
        { data: previousSeasonStatisticsData, error: previousSeasonStatisticsError },
      ] = await Promise.all([
        supabase
          .from('players_view')
          .select(`*`)
          .order('minutes', { ascending: false }),
        supabase
          .from('player_statistics')
          .select('player_id, goals, assists, clean_sheet, red_card, points'),
        supabase
          .from('player_previous_season_statistics')
          .select('player_id, goals, assists, clean_sheets, red_cards, points, minutes'),
      ]);

      if (playerError) {
        console.error('Error fetching data:', playerError.message);
        return;
      }

      if (playerStatisticsError) {
        console.error('Error fetching player statistics:', playerStatisticsError.message);
        return;
      }

      if (previousSeasonStatisticsError) {
        console.warn('Could not load previous-season player statistics:', previousSeasonStatisticsError.message);
      }

      players.value = mergePlayersWithSeasonStatistics(
        playerData ?? [],
        playerStatisticsData ?? [],
        mapPreviousSeasonStatistics(previousSeasonStatisticsData ?? []),
      );
      await fetchPlayerDataLastSyncedAt();
      isLoaded.value = true;
    }
    catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        console.error('Error:', (error as Error).message);
      }
      else {
        console.error('An unknown error occurred.');
      }
    }
  };

  const fetchClubs = async () => {
    const supabase = useSupabaseClient<Database>();
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, short_name')
      .order('name');

    if (error) throw new Error(error.message);
    clubs.value = data ?? [];
  };

  const fetchPlayerDataLastSyncedAt = async () => {
    const supabase = useSupabaseClient<Database>();
    const { data, error } = await supabase
      .from('settings')
      .select('setting_value')
      .eq('setting_key', 'player_data_last_synced_at')
      .maybeSingle();

    if (error) {
      console.warn('Could not load player data sync status:', error.message);
      return;
    }

    playerDataLastSyncedAt.value = data?.setting_value ?? null;
  };

  const upsertPlayerData = async (playerData: string) => {
    const supabase = useSupabaseClient<Database>();
    const formattedPlayerData: PlayerInsertData[] = JSON.parse(playerData)?.elements;
    if (formattedPlayerData === null) {
      throw new Error('Player data was not correct, please try again.');
    }

    const { error } = await supabase
      .from('players')
      .upsert(
        formattedPlayerData.map(({
          id,
          code,
          cost_change_event,
          cost_change_start_fall,
          cost_change_start,
          element_type,
          first_name,
          news,
          news_added,
          now_cost,
          photo,
          second_name,
          status,
          team,
          team_code,
          web_name,
          minutes,
          total_points,
          goals_scored,
          assists,
          clean_sheets,
          red_cards,
        }) => ({
          player_id: id,
          code,
          cost_change_event,
          cost_change_start_fall,
          cost_change_start,
          element_type,
          first_name,
          news,
          news_added,
          now_cost,
          photo,
          second_name,
          status,
          team,
          team_code,
          web_name,
          minutes,
          total_points,
          goals_scored,
          assists,
          clean_sheets,
          red_cards,
        })),

      )
      .select();

    if (error) {
      throw new Error(error.message);
    }
  };

  const getPlayerDataLastSyncedAt = computed(() => playerDataLastSyncedAt.value);

  const getPlayerByID = computed(
    () => (id: number) => players.value.find(x => x.player_id === id),
  );

  const getPlayers = computed(() => players.value);
  const getClubs = computed(() => clubs.value);

  return {
    players,
    isLoaded,
    fetchPlayers,
    fetchClubs,
    upsertPlayerData,
    getPlayers,
    getClubs,
    getPlayerByID,
    getPlayerDataLastSyncedAt,
  };
});

export {
  aggregatePlayerStatistics,
  mapPreviousSeasonStatistics,
  mergePlayersWithSeasonStatistics,
};
