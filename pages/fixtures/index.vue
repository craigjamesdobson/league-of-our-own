<script setup lang="ts">
import { useDraftedTeamsStore } from '~/stores/draftedTeams';
import { useFixtureStore } from '~/stores/fixtures';
import type { DraftedTeamWithWeeklyStats, WeeklyStats } from '~/types/DraftedTeam';
const supabase = useSupabaseClient();

const route = useRoute();
const router = useRouter();
const fixtureStore = useFixtureStore();
const weeks = ref(Array.from({ length: 38 }, (_, index) => index + 1));
const selectedWeek = ref(+route.query.week || 1);


const draftedTeamsStore = useDraftedTeamsStore();
const draftedTeamsWithPoints: Ref<DraftedTeamWithWeeklyStats[] | undefined> = ref()

onMounted(async () => {
  draftedTeamsWithPoints.value = await draftedTeamsStore.fetchDraftedTeamsWithPlayerPointsByGameweek(selectedWeek.value);
})

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

const populateWeeklyStats = (data: WeeklyStats) => {
  const currentDraftedTeam = draftedTeamsWithPoints.value?.find(x => x.drafted_team_id === data.drafted_team_id)
  currentDraftedTeam!.weekly_stats = data;
}

const updateWeeklyStats = async () => {

  const formattedWeeklyData = draftedTeamsWithPoints.value!.map(x => ({
    team: x.drafted_team_id,
    week: selectedWeek.value,
    points: x.weekly_stats.points,
    goals: x.weekly_stats.goals,
    assists: x.weekly_stats.assists,
    clean_sheets: x.weekly_stats.clean_sheets,
    red_cards: x.weekly_stats.red_cards,
  }))

  const { error: deleteError } = await supabase
  .from('weekly_statistics')
  .delete()
  .eq('week', selectedWeek.value)

  if (deleteError) throw new Error('Failed to update this gameweek')

  await supabase
    .from('weekly_statistics')
    .insert(formattedWeeklyData)
    .select();


  console.log(draftedTeamsWithPoints.value?.map(x => x.weekly_stats))
}
</script>

<template>
  <div>
    <div class="flex justify-between">
      <h1 class="text-2xl font-black uppercase">Fixtures</h1>
      <div class="flex flex-col gap-2.5 mb-5 items-end">
        <label class="font-bold uppercase" for="gameweeks">Select a game week</label>
        <div class="flex gap-2.5">
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
          <Button @click="updateWeeklyStats" label="Save week" />
        </div>
      </div>
    </div>
    <div class="flex gap-5">
      <div v-if="fixtureStore.fixtures" class="flex flex-col gap-2.5 w-1/3">
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
      <div class="grid grid-cols-3 gap-5 w-2/3">
        <template v-for="draftedTeam in draftedTeamsWithPoints">
          <DraftedTeamWithPoints :drafted-team="draftedTeam" :active-week="selectedWeek"
            @calculated-weekly-stats="populateWeeklyStats" />
        </template>
      </div>
    </div>
  </div>
</template>

<style>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  opacity: 1;
}
</style>