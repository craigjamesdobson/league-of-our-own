import { defineStore } from 'pinia';
import type { Fixture } from '~/types/Fixture';
import type { PlayerWithStats } from '~/types/Player';
import { type Database, type TablesInsert } from '~/types/database.types';

const getPlayersWithStats = (players: PlayerWithStats[]) => {
  return players!.filter((player) => {
    return (
      player.week_assists > 0 ||
      player.week_goals > 0 ||
      player.week_redcard ||
      player.week_cleansheet
    );
  });
};

export const useFixtureStore = defineStore('fixture-store', () => {
  const supabase = useSupabaseClient<Database>();

  const fixtures: Ref<Fixture[] | null> = ref(null);

  const fetchFixtures = async (gameweekID: number) => {
    fixtures.value = null;
    const { data } = await supabase
      .from('fixtures')
      .select(
        `
          id,
          home_team_score,
          away_team_score,
          home_team (id, name, short_name),
          away_team (id, name, short_name)
        `
      )
      .eq('game_week', gameweekID)
      .order('id')
      .returns<Fixture[]>();
    fixtures.value = data;
  };

  const fetchFixtureByID = async (id: number) => {
    const { data } = await supabase
      .from('fixtures')
      .select(
        `
          id,
          game_week,
          home_team_score,
          away_team_score,
          home_team (id, name, short_name),
          away_team (id, name, short_name)
        `
      )
      .eq('id', id)
      .returns<Fixture[]>()
      .single();
    return data;
  };

  const updateFixtureScore = async (fixtureData: Fixture) => {
    const formattedFixture: TablesInsert<'fixtures'> = {
      id: fixtureData.id,
      home_team_score: fixtureData.home_team_score,
      away_team_score: fixtureData.away_team_score,
    };

    const selectedFixtureIndex = fixtures.value?.findIndex(
      (x) => x.id === fixtureData.id
    );

    if (!selectedFixtureIndex || !fixtures.value)
      throw new Error('No fixture found');

    fixtures.value[selectedFixtureIndex] = fixtureData;

    const { data, error } = await supabase
      .from('fixtures')
      .upsert(formattedFixture)
      .select();

    if (error) throw new Error(error.message);

    console.log(data);
  };

  const updatePlayerStatistics = async (
    PlayersWithStats: PlayerWithStats[],
    fixtureID: number
  ) => {
    const { error: deleteError } = await supabase
      .from('player_statistics')
      .delete()
      .eq('fixture_id', fixtureID);

    if (deleteError) throw new Error(deleteError.message);

    const filteredPlayers = getPlayersWithStats(PlayersWithStats);

    const formattedPlayers = filteredPlayers.map((x) => {
      return {
        player_id: x.player_id,
        fixture_id: fixtureID,
        goals: x.week_goals,
        assists: x.week_assists,
        clean_sheet: x.week_cleansheet,
        red_card: x.week_redcard,
      };
    });

    const { data, error } = await supabase
      .from('player_statistics')
      .upsert(formattedPlayers, { onConflict: 'fixture_id, player_id' })
      .select();

    if (error) throw new Error(error.message);

    console.log(data);
  };

  const getFixtureByID = computed(() => {
    return (id: number) => fixtures.value?.find((x) => x.id === id);
  });

  return {
    fixtures,
    fetchFixtures,
    fetchFixtureByID,
    updateFixtureScore,
    updatePlayerStatistics,
    getFixtureByID,
  };
});
