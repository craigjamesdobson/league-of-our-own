import { defineStore } from 'pinia';
import type { Fixture } from '~/types/Fixture';
import { type Database } from '~/types/database.types';

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
      .returns<Fixture>()
      .single();
    return data;
  };

  const getFixtureByID = computed(() => {
    return (id: number) => fixtures.value?.find((x) => x.id === id);
  });

  return {
    fixtures,
    fetchFixtures,
    fetchFixtureByID,
    getFixtureByID,
  };
});
