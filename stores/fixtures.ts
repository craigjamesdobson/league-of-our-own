import { defineStore } from 'pinia';
import type { Fixture } from '~/types/Fixture';
import { type Database, type TablesInsert } from '~/types/database.types';

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

  const upsertFixtureScore = async (fixtureData: Fixture) => {
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

  const getFixtureByID = computed(() => {
    return (id: number) => fixtures.value?.find((x) => x.id === id);
  });

  return {
    fixtures,
    fetchFixtures,
    fetchFixtureByID,
    upsertFixtureScore,
    getFixtureByID,
  };
});
