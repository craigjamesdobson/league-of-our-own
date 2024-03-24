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
        />
      </div>
    </div>
    <div
      v-if="fixtureStore.playersWithStats"
      class="grid grid-cols-2 gap-10 m-20"
    >
      <Card
        v-for="(fixture, index) in fixtureStore.playersWithStats"
        :key="fixture.id"
      >
        <template #title>
          <div class="flex justify-between">
            <span
              class="text-xs bg-primary-500 w-8 h-8 flex items-center justify-center text-white rounded-full"
            >
              {{ index + 1 }}
            </span>
            <Button
              aria-label="Clear player"
              outlined
              rounded
              class="!w-8 !h-8"
            >
              <NuxtLink :to="`/fixtures/${fixture.id}`">
                <Icon size="22" name="mage:edit-fill"
              /></NuxtLink>
            </Button>
          </div>
        </template>
        <template #content>
          <FixtureBase :fixture="fixture" />
        </template>
      </Card>
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
