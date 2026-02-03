import { defineStore } from 'pinia';
import type { Player, PlayerInsertData, PlayerSeasonStats } from '~/types/Player';
import type { Database as DatabaseGenerated } from '~/types/database-generated.types';
import type { Database, Tables } from '~/types/database.types';
import { mapSeasonTotals, mergePlayersWithSeasonTotals } from '~/logic/players/stats';

export const usePlayerStore = defineStore('player-store', () => {
  const players: Ref<Player[] | []> = ref([]);
  const playersWithSeasonStats: Ref<PlayerSeasonStats[] | []> = ref([]);
  const playerUpdatedDate: Ref<string | null> = ref(null);
  const isLoaded = ref(false);

  const fetchPlayers = async () => {
    const supabase = useSupabaseClient<Database>();
    try {
      const { data, error } = await supabase
        .from('players_view')
        .select(`*`)
        .order('minutes', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error.message);
        return;
      }
      players.value = data;
      await fetchPlayerSeasonStatistics();
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

  const fetchPlayerSeasonStatistics = async () => {
    const supabase = useSupabaseClient<Database>();
    const { data, error } = await supabase
      .from('player_statistics_totals')
      .select();

    if (error) {
      throw new Error(error.message);
    }

    const totals = mapSeasonTotals(data as Tables<'player_statistics_totals'>[]);
    playersWithSeasonStats.value = mergePlayersWithSeasonTotals(
      [...players.value],
      totals,
    );
  };

  const fetchPlayerUpdatedDate = async () => {
    const supabase = useSupabaseClient<DatabaseGenerated>();
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
    const supabase = useSupabaseClient<DatabaseGenerated>();
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
  const getPlayersWithSeasonStats = computed(() => playersWithSeasonStats.value);

  return {
    players,
    isLoaded,
    fetchPlayers,
    fetchPlayerSeasonStatistics,
    upsertPlayerData,
    getPlayers,
    getPlayersWithSeasonStats,
    getPlayerByID,
    getPlayerLastUpdatedDate,
  };
});
