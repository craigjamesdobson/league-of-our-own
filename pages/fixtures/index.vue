<script setup lang="ts">
import type { Database } from '~/types/database.types';

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

const fixtures: Ref<Fixture[] | undefined> = ref();
const supabase = useSupabaseClient<Database>();

const fetchFixtures = async () => {
  const { data } = await supabase.from('fixtures').select(`
  id,
  home_team (id, name, short_name),
  away_team (id, name, short_name)
`);
  // @ts-ignore - typings coming back from supabase is wrong
  fixtures.value = data;
};

await fetchFixtures();
</script>

<template>
  <div>
    <h1>Fixtures</h1>
    <div
      v-for="fixture in fixtures"
      :key="fixture.id"
      class="grid grid-cols-2 gap-5 mb-5"
    >
      <Fixture :fixture="fixture" />
    </div>
  </div>
</template>

<style>
/* ensures the increment/decrement arrows always display */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  opacity: 1;
}
</style>
