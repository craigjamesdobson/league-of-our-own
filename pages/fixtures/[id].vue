<template>
  <div class="flex flex-col">
    <Toast />
    <div v-if="!!fixture" class="grid grid-cols-2 gap-5">
      <div>
        <div class="flex justify-center gap-5 items-center m-10">
          <img
            class="w-16 h-w-16 aspect-square"
            :src="getImageUrl(fixture.home_team.short_name.toLowerCase())"
          />
          <p class="uppercase font-black">{{ fixture?.home_team.name }}</p>
          <input
            v-model="fixture.home_team_score"
            class="p-1 border rounded w-16"
            type="number"
            min="0"
          />
        </div>
        <FixtureStatsInput v-model:players="homePlayers" />
      </div>
      <div>
        <div class="flex justify-center gap-5 items-center m-10">
          <input
            v-model="fixture.away_team_score"
            class="p-1 border rounded w-16"
            type="number"
            min="0"
          />
          <p class="uppercase font-black">{{ fixture?.away_team.name }}</p>
          <img
            class="w-16 h-w-16 aspect-square"
            :src="getImageUrl(fixture.away_team.short_name.toLowerCase())"
          />
        </div>
        <FixtureStatsInput v-model:players="awayPlayers" />
      </div>
    </div>
    <Button class="mx-auto my-10" label="Save Fixture" @click="updateFixture" />
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useFixtureStore } from '~/stores/fixtures';
import type { Database } from '~/types/database.types';
import type { Fixture } from '~/types/Fixture';
import type { PlayerWithStats } from '~/types/Player';

const supabase = useSupabaseClient<Database>();

const route = useRoute();
const fixtureStore = useFixtureStore();
const toast = useToast();

const fixture: Ref<Fixture | null> = ref(null);

fixture.value = await fixtureStore.fetchFixtureByID(+route.params.id);

const { data: homePlayers } = await supabase
  .rpc('get_player_stats_by_team_id_for_fixture', {
    team_id_param: fixture.value!.home_team.id,
    fixture_id_param: fixture.value!.id,
  })
  .returns<PlayerWithStats[]>();

const { data: awayPlayers } = await supabase
  .rpc('get_player_stats_by_team_id_for_fixture', {
    team_id_param: fixture.value!.away_team.id,
    fixture_id_param: fixture.value!.id,
  })
  .returns<PlayerWithStats[]>();

const updateFixture = async () => {
  if (!fixture.value) throw new Error('No fixture');

  if (!homePlayers || !awayPlayers) throw new Error('No players');

  try {
    const a = fixtureStore.updateFixtureScore(fixture.value);
    const b = fixtureStore.updatePlayerStatistics(
      [...homePlayers, ...awayPlayers],
      fixture.value.id
    );

    await Promise.all([a, b]);

    handleApiSuccess('Fixture has been updated', toast);
  } catch (error) {
    handleApiError(error, toast);
  }
};
</script>

<style scoped></style>
