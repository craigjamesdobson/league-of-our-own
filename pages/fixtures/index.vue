<script setup lang="ts">
import { useFixtureStore } from '~/stores/fixtures';

const fixtureStore = useFixtureStore();
const selectedWeek = ref(1);

definePageMeta({
  middleware: ['auth']
});

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
      <h1 class="text-2xl font-black uppercase">Fixtures</h1>
      <div class="flex flex-col gap-2.5">
        <label class="font-bold uppercase" for="gameweeks"
          >Select a game week</label
        >
        <Dropdown
          id="gameweeks"
          v-model="selectedWeek"
          :options="
            Array.from({ length: 38 }, (_, i) => ({
              label: `Week ${i + 1}`,
              value: i + 1
            }))
          "
          option-label="label"
          option-value="value"
          placeholder="Select a game week"
        />
      </div>
    </div>
    <div
      v-if="fixtureStore.fixtures"
      class="mx-20 my-10 grid gap-10 xl:grid-cols-2"
    >
      <NuxtLink
        v-for="(fixture, index) in fixtureStore.fixtures"
        :key="fixture.id"
        :to="`/fixtures/${fixture.id}`"
        class="bg-surface-50 hover:border-primary border p-5 duration-300 ease-in-out *:transition-all"
      >
        <FixtureBase v-model:fixture="fixtureStore.fixtures[index]" />
      </NuxtLink>
    </div>
    <div v-else class="mx-20 my-10 grid gap-10 xl:grid-cols-2">
      <div v-for="i in 6" :key="i" class="bg-surface-50 border p-5">
        <SkeletonFixture />
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
