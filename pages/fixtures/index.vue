<script setup lang="ts">
import { useDraftedTeamsStore } from '~/stores/draftedTeams';
import { useFixtureStore } from '~/stores/fixtures';

const route = useRoute();
const router = useRouter();
const fixtureStore = useFixtureStore();
const weeks = ref(Array.from({ length: 38 }, (_, index) => index + 1));
const selectedWeek = ref(+route.query.week || 1);

const draftedTeamsStore = useDraftedTeamsStore();

const draftedTeamsWithPoints = ref(await draftedTeamsStore.fetchDraftedTeamsWithPlayerPointsByGameweek(selectedWeek.value));

definePageMeta({
  middleware: ['auth']
});


watch(
  selectedWeek,
  async (newWeek) => {
    await fixtureStore.fetchFixtures(newWeek);
    draftedTeamsWithPoints.value = await draftedTeamsStore.fetchDraftedTeamsWithPlayerPointsByGameweek(newWeek)
    fixtureStore.selectedGameweek = newWeek;
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
      <div class="flex flex-col gap-2.5">
        <label class="font-bold uppercase" for="gameweeks">Select a game week</label>
        <Dropdown v-model="selectedWeek" :options="weeks" placeholder="Select a gameweek" scroll-height="400">
          <template #value="slotProps">
            <div class="flex items-center">
              <div>WEEK {{ slotProps.value }}</div>
            </div>
          </template>
          <template #option="slotProps">
            <div class="flex items-center">
              <div>WEEK {{ slotProps.option }}</div>
            </div>
          </template>
        </Dropdown>
      </div>
    </div>
    <div v-if="fixtureStore.fixtures" class="my-10 grid gap-10 xl:grid-cols-2">
      <NuxtLink v-for="(fixture, index) in fixtureStore.fixtures" :key="fixture.id" :to="`/fixtures/${fixture.id}`"
        class="bg-surface-50 hover:border-primary rounded-sm border p-5 duration-300 ease-in-out *:transition-all"
        :class="{
          'border-green-500':
            fixture.home_team_score !== null && fixture.away_team_score !== null
        }">
        <FixtureBase v-model:fixture="fixtureStore.fixtures[index]" />
      </NuxtLink>
    </div>
    <div v-else class="my-10 grid gap-10 xl:grid-cols-2">
      <div v-for="i in 6" :key="i" class="bg-surface-50 border p-5">
        <SkeletonFixture />
      </div>
    </div>
    <div class="grid grid-cols-4 gap-5">
      <template v-for="draftedTeam in draftedTeamsWithPoints">
        <DraftedTeamWithPoints :drafted-team="draftedTeam" />
      </template>
    </div>
  </div>
</template>

<style>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  opacity: 1;
}
</style>
