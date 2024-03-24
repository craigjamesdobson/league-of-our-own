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

  const getFixtureByID = computed(() => {
    return (id: number) => fixtures.value?.find((x) => x.id === id);
  });

  return {
    fixtures,
    fetchFixtures,
    getFixtureByID,
  };
});
