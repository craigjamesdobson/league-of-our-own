<script setup lang="ts">
import { useFixtureStore } from '~/stores/fixtures';

const fixtureStore = useFixtureStore();
const selectedWeek = ref(1);

watch(
  selectedWeek,
  async (newWeek) => {
    await useAsyncData('fixtures', () => fixtureStore.fetchFixtures(newWeek));

    await useAsyncData('players-with-stats', () =>
      fixtureStore.formatFixturesAndPlayers(newWeek)
    );
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <div class="flex justify-between">
      <h1 class="font-black text-2xl uppercase my-2">Fixtures</h1>
      <div class="flex flex-col gap-2.5">
        <label for="gameweeks">Select a game week</label>
        <Dropdown
          id="gameweeks"
          v-model="selectedWeek"
          :options="
            Array.from({ length: 38 }, (_, i) => ({
              label: `Week ${i + 1}`,
              value: i + 1,
            }))
          "
          option-label="label"
          option-value="value"
          placeholder="Select a game week"
          class="w-full md:w-[14rem]"
        />
      </div>
    </div>
    <div v-if="fixtureStore.playersWithStats">
      <div
        v-for="fixture in fixtureStore.playersWithStats"
        :key="fixture.id"
        class="grid grid-cols-2 gap-5 mb-5"
      >
        <Fixture :fixture="fixture" />
      </div>
    </div>
    <div class="my-5">
      <div class="grid grid-cols-2 gap-5 mb-5">
        <DataTable v-for="x in 4" :key="x" :value="new Array(5)">
          <Column field="Player" header="Player">
            <template #body>
              <Skeleton></Skeleton>
            </template>
          </Column>
          <Column field="Goals" header="Goals">
            <template #body>
              <Skeleton></Skeleton>
            </template>
          </Column>
          <Column field="Assists" header="Assists">
            <template #body>
              <Skeleton></Skeleton>
            </template>
          </Column>
          <Column field="Clean sheet" header="Clean sheet">
            <template #body>
              <Skeleton></Skeleton>
            </template>
          </Column>
          <Column field="Red card" header="Red card">
            <template #body>
              <Skeleton></Skeleton>
            </template>
          </Column>
        </DataTable>
      </div>
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
