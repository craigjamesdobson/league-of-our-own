<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useDraftedTeamsStore } from '~/stores/draftedTeams';
import { useFixtureStore } from '~/stores/fixtures';
import type {
  DraftedTeamWithWeeklyStats,
  WeeklyStats
} from '~/types/DraftedTeam';

const supabase = useSupabaseClient();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const fixtureStore = useFixtureStore();
const weeks = ref(Array.from({ length: 38 }, (_, index) => index + 1));
const selectedWeek = ref(+route.query.week || 1);

const draftedTeamsStore = useDraftedTeamsStore();
const draftedTeamsWithPoints: Ref<DraftedTeamWithWeeklyStats[] | undefined> =
  ref();

onMounted(async () => {
  draftedTeamsWithPoints.value =
    await draftedTeamsStore.fetchDraftedTeamsWithPlayerPointsByGameweek(
      selectedWeek.value
    );
});

definePageMeta({
  middleware: ['auth']
});

watch(
  selectedWeek,
  async (newWeek) => {
    await fixtureStore.fetchFixtures(newWeek);
    draftedTeamsWithPoints.value = undefined;
    draftedTeamsWithPoints.value =
      await draftedTeamsStore.fetchDraftedTeamsWithPlayerPointsByGameweek(
        newWeek
      );
    fixtureStore.selectedGameweek = newWeek;
    await router.push({
      path: 'fixtures',
      query: { week: newWeek }
    });
  },
  { immediate: true }
);

const populateWeeklyStats = (data: WeeklyStats) => {
  const currentDraftedTeam = draftedTeamsWithPoints.value?.find(
    (x) => x.drafted_team_id === data.drafted_team_id
  );
  currentDraftedTeam!.weekly_stats = data;
};

const updateWeeklyStats = async () => {
  const formattedWeeklyData = draftedTeamsWithPoints.value!.map((x) => ({
    team: x.drafted_team_id,
    week: selectedWeek.value,
    points: x.weekly_stats.points,
    goals: x.weekly_stats.goals,
    assists: x.weekly_stats.assists,
    clean_sheets: x.weekly_stats.clean_sheets,
    red_cards: x.weekly_stats.red_cards
  }));

  const { error: deleteError } = await supabase
    .from('weekly_statistics')
    .delete()
    .eq('week', selectedWeek.value);

  if (deleteError) throw new Error('Failed to update this gameweek');

  await supabase.from('weekly_statistics').insert(formattedWeeklyData).select();

  handleApiSuccess(`Week ${selectedWeek.value} has been updated`, toast);
};
</script>

<template>
  <div>
    <Toast />
    <div class="flex justify-between">
      <h1 class="text-2xl font-black uppercase">Fixtures</h1>
      <div class="mb-5 flex flex-col items-end gap-2.5">
        <label class="font-bold uppercase" for="gameweeks"
          >Select a game week</label
        >
        <div class="flex gap-2.5">
          <Dropdown
            v-model="selectedWeek"
            :options="weeks"
            placeholder="Select a gameweek"
            scroll-height="400"
          >
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
          <Button label="Save week" @click="updateWeeklyStats" />
        </div>
      </div>
    </div>
    <div class="flex flex-col items-start gap-5 lg:flex-row">
      <div
        v-if="fixtureStore.fixtures"
        class="flex w-full flex-col gap-2.5 lg:w-1/3"
      >
        <NuxtLink
          v-for="(fixture, index) in fixtureStore.fixtures"
          :key="fixture.id"
          :to="`/fixtures/${fixture.id}`"
          class="bg-surface-50 hover:border-primary rounded-sm border p-5 duration-300 ease-in-out *:transition-all"
          :class="{
            'border-green-500':
              fixture.home_team_score !== null &&
              fixture.away_team_score !== null
          }"
        >
          <FixtureBase v-model:fixture="fixtureStore.fixtures[index]" />
        </NuxtLink>
      </div>
      <div v-else class="flex w-full flex-col gap-2.5 lg:w-1/3">
        <div v-for="i in 6" :key="i" class="bg-surface-50 border p-5">
          <SkeletonFixture />
        </div>
      </div>
      <div
        v-if="draftedTeamsWithPoints"
        class="grid w-full gap-5 lg:w-2/3 lg:grid-cols-3"
      >
        <template
          v-for="(draftedTeam, index) in draftedTeamsWithPoints"
          :key="index"
        >
          <DraftedTeamWithPoints
            :drafted-team="draftedTeam"
            :active-week="selectedWeek"
            @calculated-weekly-stats="populateWeeklyStats"
          />
        </template>
      </div>
      <div v-else class="grid w-2/3 grid-cols-3 gap-5">
        <template v-for="(_, index) in 6" :key="index">
          <SkeletonDraftedTeam />
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
