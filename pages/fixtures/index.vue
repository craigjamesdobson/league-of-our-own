<script setup lang="ts">
import { useFixtureStore } from '~/stores/fixtures';

const route = useRoute();
const router = useRouter();
const fixtureStore = useFixtureStore();
const selectedWeek = ref(route.query.week ?? 1);

definePageMeta({
  middleware: ['auth']
});

watch(
  selectedWeek,
  async (newWeek) => {
    await fixtureStore.fetchFixtures(newWeek);
    await router.push({
      path: 'fixtures',
      query: { week: newWeek }
    });
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <div class="flex justify-between">
      <h1 class="text-2xl font-black uppercase">Fixtures</h1>
    </div>
    <div class="my-10 flex flex-col gap-2.5">
      <label class="font-bold uppercase" for="gameweeks"
        >Select a game week</label
      >
      <div class="grid-cols-19 grid gap-2">
        <Button
          v-for="(week, i) in 38"
          :key="week"
          rounded
          :outlined="week != selectedWeek"
          :label="(i + 1).toString()"
          @click="selectedWeek = week"
        />
      </div>
    </div>
    <div v-if="fixtureStore.fixtures" class="my-10 grid gap-10 xl:grid-cols-2">
      <NuxtLink
        v-for="(fixture, index) in fixtureStore.fixtures"
        :key="fixture.id"
        :to="`/fixtures/${fixture.id}`"
        class="bg-surface-50 hover:border-primary rounded-sm border p-5 duration-300 ease-in-out *:transition-all"
        :class="{
          'border-green-500':
            fixture.home_team_score !== null && fixture.away_team_score !== null
        }"
      >
        <FixtureBase v-model:fixture="fixtureStore.fixtures[index]" />
      </NuxtLink>
    </div>
    <div v-else class="my-10 grid gap-10 xl:grid-cols-2">
      <div v-for="i in 6" :key="i" class="bg-surface-50 border p-5">
        <SkeletonFixture />
      </div>
    </div>
    <DraftedTeams />
  </div>
</template>

<style>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  opacity: 1;
}
</style>
