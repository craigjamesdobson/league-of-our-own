<template>
  <div>
    <Toast />
    <div v-if="!!fixture" class="flex flex-col">
      <div class="grid grid-cols-2 gap-5">
        <div>
          <div class="m-10 flex items-center justify-center gap-5">
            <img
              class="aspect-square h-32 w-32"
              :src="getImageUrl(fixture.home_team.short_name.toLowerCase())"
            />
            <div class="flex flex-col items-center gap-2.5">
              <p class="text-xl font-black uppercase">
                {{ fixture?.home_team.name }}
              </p>
              <input
                v-model="fixture.home_team_score"
                class="h-10 w-20 rounded border p-2 text-lg"
                type="number"
                min="0"
              />
            </div>
          </div>
          <FixtureStatsInput
            v-if="homePlayers"
            v-model:players="homePlayers"
            :disable-cleansheet="fixture.away_team_score > 0"
          />
          <div v-else>
            <SkeletonStatsInput />
          </div>
        </div>
        <div>
          <div class="m-10 flex items-center justify-center gap-5">
            <div class="flex flex-col items-center gap-2.5">
              <p class="text-xl font-black uppercase">
                {{ fixture?.away_team.name }}
              </p>
              <input
                v-model="fixture.away_team_score"
                class="h-10 w-20 rounded border p-2 text-lg"
                type="number"
                min="0"
              />
            </div>
            <img
              class="aspect-square h-32 w-32"
              :src="getImageUrl(fixture.away_team.short_name.toLowerCase())"
            />
          </div>
          <FixtureStatsInput
            v-if="awayPlayers"
            v-model:players="awayPlayers"
            :disable-cleansheet="fixture.home_team_score > 0"
          />
          <div v-else>
            <SkeletonStatsInput />
          </div>
        </div>
      </div>
      <Button
        class="mx-auto my-10"
        label="Save Fixture"
        @click="updateFixture"
      />
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useFixtureStore } from '~/stores/fixtures';
import type { Fixture } from '~/types/Fixture';
import type { PlayerWithStats } from '~/types/Player';

const route = useRoute();
const fixtureStore = useFixtureStore();
const toast = useToast();

const fixture: Ref<Fixture | null> = ref(null);

fixture.value = await fixtureStore.fetchFixtureByID(+route.params.id);

const homePlayers: Ref<PlayerWithStats[] | undefined> = ref();
const awayPlayers: Ref<PlayerWithStats[] | undefined> = ref();

const populatePlayers = async () => {
  homePlayers.value = await fixtureStore.fetchPlayersWithStatistics(
    fixture.value!.id,
    fixture.value!.home_team.id
  );

  awayPlayers.value = await fixtureStore.fetchPlayersWithStatistics(
    fixture.value!.id,
    fixture.value!.away_team.id
  );
};

populatePlayers();

const updateFixture = async () => {
  if (!fixture.value) throw new Error('No fixture');

  if (!homePlayers.value || !awayPlayers.value) throw new Error('No players');

  try {
    const a = fixtureStore.updateFixtureScore(fixture.value);
    const b = fixtureStore.updatePlayerStatistics(
      [...homePlayers.value, ...awayPlayers.value],
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
