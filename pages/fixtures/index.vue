<script setup lang="ts">
import { useFixtureStore } from '~/stores/fixtures';

const fixtureStore = useFixtureStore();
const selectedWeek = ref(1);

watch(
  selectedWeek,
  async (newWeek) => {
    await fixtureStore.fetchFixtures(newWeek);
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
        />
      </div>
    </div>
    <div v-if="fixtureStore.fixtures" class="grid grid-cols-2 gap-10 m-20">
      <NuxtLink
        v-for="fixture in fixtureStore.fixtures"
        :key="fixture.id"
        :to="`/fixtures/${fixture.id}`"
        class="p-5 bg-surface-50 border hover:border-primary *:transition-all ease-in-out duration-300"
      >
        <FixtureBase :fixture="fixture" />
      </NuxtLink>
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
