import { defineStore } from 'pinia';
import type {
  Player,
  PlayerInsertData,
  PlayerSeasonStatistics,
  PlayerWithSeasonStatistics,
} from '~/types/Player';
import type { Database, Tables } from '~/types/database.types';

type PlayerStatisticRow = Pick<Tables<'player_statistics'>, 'player_id' | 'goals' | 'assists' | 'clean_sheet' | 'red_card' | 'points'>;
type Club = Pick<Tables<'teams'>, 'id' | 'name' | 'short_name'>;

const emptyPlayerSeasonStatistics = (): PlayerSeasonStatistics => ({
  season_goals: 0,
  season_assists: 0,
  season_clean_sheets: 0,
  season_red_cards: 0,
  season_points: 0,
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

const mergePlayersWithSeasonStatistics = (
  players: Player[],
  playerStatistics: PlayerStatisticRow[],
): PlayerWithSeasonStatistics[] => {
  const statisticsByPlayerId = aggregatePlayerStatistics(playerStatistics);

  return players.map(player => ({
    ...player,
    ...(statisticsByPlayerId.get(player.player_id) ?? emptyPlayerSeasonStatistics()),
  }));
};

export const usePlayerStore = defineStore('player-store', () => {
  const players: Ref<PlayerWithSeasonStatistics[]> = ref([]);
  const clubs: Ref<Club[]> = ref([]);
  const playerUpdatedDate: Ref<string | null> = ref(null);
  const isLoaded = ref(false);

  const fetchPlayers = async () => {
    const supabase = useSupabaseClient<Database>();
    try {
      const [
        { data: playerData, error: playerError },
        { data: playerStatisticsData, error: playerStatisticsError },
      ] = await Promise.all([
        supabase
          .from('players_view')
          .select(`*`)
          .order('minutes', { ascending: false }),
        supabase
          .from('player_statistics')
          .select('player_id, goals, assists, clean_sheet, red_card, points'),
      ]);

      if (playerError) {
        console.error('Error fetching data:', playerError.message);
        return;
      }

      if (playerStatisticsError) {
        console.error('Error fetching player statistics:', playerStatisticsError.message);
        return;
      }

      players.value = mergePlayersWithSeasonStatistics(playerData ?? [], playerStatisticsData ?? []);
      await fetchPlayerUpdatedDate();
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

  const fetchPlayerUpdatedDate = async () => {
    const supabase = useSupabaseClient<Database>();
    const { data, error } = await supabase
      .from('players')
      .select('updated_at')
      .limit(1)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    playerUpdatedDate.value = data.updated_at;
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

  const getPlayerLastUpdatedDate = computed(() => playerUpdatedDate.value);

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
    getPlayerLastUpdatedDate,
  };
});

export {
  aggregatePlayerStatistics,
  mergePlayersWithSeasonStatistics,
};
