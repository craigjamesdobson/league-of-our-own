import { defineStore } from 'pinia';
import { type Database } from '~/types/database.types';

export const useFixtureStore = defineStore('fixture-store', () => {
  const supabase = useSupabaseClient<Database>();

  interface Team {
    id: number;
    name: string;
    short_name: string;
  }

  interface Fixture {
    id: number;
    home_team: Team;
    away_team: Team;
  }

  const fixtures: Ref<Fixture[] | null> = ref(null);
  const playersWithStats = ref(null);

  const fetchFixtures = async (gameweekID: number) => {
    fixtures.value = null;
    const { data } = await supabase
      .from('fixtures')
      .select(
        `
          id,
          home_team (id, name, short_name),
          away_team (id, name, short_name)
        `
      )
      .eq('game_week', gameweekID)
      .returns<Fixture[]>();
    fixtures.value = data;
  };

  const getPlayersWithStats = async (gameweekID: number) => {
    playersWithStats.value = null;
    const { data } = await supabase.rpc('get_players_with_stats_for_gameweek', {
      gameweek_id: gameweekID,
    });

    return data;
  };

  const formatFixturesAndPlayers = async (gameweekID: number) => {
    const players = await getPlayersWithStats(gameweekID);
    const data = fixtures.value?.map((x) => {
      return {
        id: x.id,
        home_team: x.home_team,
        home_players: players.filter(
          (player) => player.team === x.home_team.id
        ),
        away_team: x.away_team,
        away_players: players.filter(
          (player) => player.team === x.away_team.id
        ),
      };
    });

    playersWithStats.value = data;
  };

  const getFixtureByID = computed(() => {
    return (id: number) => fixtures.value?.find((x) => x.id === id);
  });

  // const getFixturesWithPlayers = computed(() => {
  //   return fixtures.value?.map((x) => {
  //     return {
  //       id: x.id,
  //       home_team: x.home_team,
  //       home_players: playersWithStats.value.filter(
  //         (player) => player.team === x.home_team.id
  //       ),
  //       away_team: x.away_team,
  //       away_players: playersWithStats.value.filter(
  //         (player) => player.team === x.away_team.id
  //       ),
  //     };
  //   });
  // });

  return {
    fixtures,
    fetchFixtures,
    playersWithStats,
    getFixtureByID,
    formatFixturesAndPlayers,
  };
});
