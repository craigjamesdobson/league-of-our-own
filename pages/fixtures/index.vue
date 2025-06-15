<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useDraftedTeamsStore } from '~/stores/draftedTeams';
import { useFixtureStore } from '~/stores/fixtures';
import type {
  DraftedTeamWithWeeklyStats,
  WeeklyStats,
} from '~/types/DraftedTeam';

const supabase = useSupabaseClient();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const fixtureStore = useFixtureStore();
const weeks = ref(Array.from({ length: 38 }, (_, i) => i + 1));
const selectedWeek = ref(Number(route.query.week) || 1);

const draftedTeamsStore = useDraftedTeamsStore();
const draftedTeamsWithPoints: Ref<DraftedTeamWithWeeklyStats[] | undefined>
  = ref();

onMounted(async () => {
  draftedTeamsWithPoints.value
    = await draftedTeamsStore.fetchDraftedTeamsWithPlayerPointsByGameweek(
      selectedWeek.value,
    );
});

definePageMeta({
  middleware: ['auth'],
});

watch(
  selectedWeek,
  async (newWeek) => {
    await fixtureStore.fetchFixtures(newWeek);
    draftedTeamsWithPoints.value = undefined;
    draftedTeamsWithPoints.value
      = await draftedTeamsStore.fetchDraftedTeamsWithPlayerPointsByGameweek(
        newWeek,
      );
    fixtureStore.selectedGameweek = newWeek;
    await router.push({
      path: 'fixtures',
      query: { week: newWeek },
    });
  },
  { immediate: true },
);

const weekIsInComplete = computed(() => {
  return fixtureStore.fixtures?.some(fixture =>
    fixture.home_team_score === null || fixture.away_team_score === null,
  );
});

const weekIsVerified = computed(() => {
  return fixtureStore.checkWeekVerificationStatus(selectedWeek.value);
});

const progressStats = computed(() => {
  if (!fixtureStore.fixtures) return null;

  const total = fixtureStore.fixtures.length;
  const populated = fixtureStore.fixtures.filter(f =>
    f.home_team_score !== null && f.away_team_score !== null,
  ).length;
  const verified = fixtureStore.fixtures.filter(f => f.verified).length;
  const needsVerification = populated - verified;

  return {
    total,
    populated,
    verified,
    needsVerification,
    populatedPercentage: Math.round((populated / total) * 100),
    verifiedPercentage: Math.round((verified / total) * 100),
  };
});

const populateWeeklyStats = (data: WeeklyStats) => {
  const currentDraftedTeam = draftedTeamsWithPoints.value?.find(
    x => x.drafted_team_id === data.drafted_team_id,
  );
  currentDraftedTeam!.weekly_stats = data;
};

const updateWeeklyStats = async () => {
  const formattedWeeklyData = draftedTeamsWithPoints.value!.map(x => ({
    team: x.drafted_team_id,
    week: selectedWeek.value,
    points: x.weekly_stats.points,
    goals: x.weekly_stats.goals,
    assists: x.weekly_stats.assists,
    clean_sheets: x.weekly_stats.clean_sheets,
    red_cards: x.weekly_stats.red_cards,
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
    <div class="flex justify-between mb-2.5">
      <div class="flex flex-col gap-2.5">
        <h1 class="text-2xl font-black uppercase">
          Fixtures
        </h1>

        <div class="flex gap-2.5">
          <Message
            v-if="fixtureStore.fixtures && weekIsInComplete"
            class="!m-0"
            :closable="false"
          >
            This week is currently incomplete ({{ (progressStats?.total || 0) - (progressStats?.populated || 0) }} fixtures remaining)
          </Message>
          <Message
            v-else-if="fixtureStore.fixtures && !weekIsVerified"
            class="!m-0"
            :closable="false"
            severity="warn"
          >
            {{ progressStats?.needsVerification || 0 }} fixture{{ (progressStats?.needsVerification || 0) === 1 ? '' : 's' }} need{{ (progressStats?.needsVerification || 0) === 1 ? 's' : '' }} verification before saving
          </Message>
          <Message
            v-else-if="fixtureStore.fixtures"
            class="!m-0"
            :closable="false"
            severity="success"
          >
            All fixtures for this week have been verified ✓
          </Message>
        </div>
      </div>
      <div class="mb-5 flex flex-col items-end gap-2.5">
        <label
          class="font-bold uppercase"
          for="gameweeks"
        >Select a game week</label>
        <div class="flex gap-2.5">
          <Select
            v-model="selectedWeek"
            :options="weeks"
            placeholder="Select a gameweek"
            scroll-height="25rem"
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
          </Select>
          <Button
            label="Save week"
            :disabled="weekIsInComplete || !weekIsVerified"
            @click="updateWeeklyStats"
          />
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-5">
      <div
        v-if="fixtureStore.fixtures"
        class="grid grid-cols-2 lg:grid-cols-5 gap-5"
      >
        <NuxtLink
          v-for="(fixture, index) in fixtureStore.fixtures"
          :key="fixture.id"
          :to="`/fixtures/${fixture.id}`"
          class="bg-white hover:border-primary rounded-sm border-2 py-2.5 px-5 duration-300 ease-in-out *:transition-all relative group"
          :class="{
            'border-green-500 bg-green-50': fixture.verified,
            'border-yellow-400 bg-yellow-50': !fixture.verified && fixture.home_team_score !== null && fixture.away_team_score !== null,
            'border-gray-200 bg-gray-50': fixture.home_team_score === null || fixture.away_team_score === null,
            'hover:border-green-600': fixture.verified,
            'hover:border-yellow-500': !fixture.verified && fixture.home_team_score !== null && fixture.away_team_score !== null,
            'hover:border-primary': fixture.home_team_score === null || fixture.away_team_score === null,
          }"
        >
          <!-- Status header with badge and icon -->
          <div class="flex justify-between items-center mb-5">
            <!-- Status badge -->
            <span
              v-if="fixture.verified"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              Verified
            </span>
            <span
              v-else-if="fixture.home_team_score !== null && fixture.away_team_score !== null"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              Needs Verification
            </span>
            <span
              v-else
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
            >
              Not Populated
            </span>

            <!-- Status icon -->
            <div class="flex gap-1">
              <!-- Verified icon -->
              <div
                v-if="fixture.verified"
                class="opacity-80"
                title="Verified"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-green-600"
                >
                  <path d="M9 12l2 2 4-4" />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                </svg>
              </div>

              <!-- Needs verification icon -->
              <div
                v-else-if="fixture.home_team_score !== null && fixture.away_team_score !== null"
                class="opacity-70"
                title="Needs Verification"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-yellow-600"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path d="M12 8v4" />
                  <path d="m12 16 .01 0" />
                </svg>
              </div>

              <!-- Empty fixture icon -->
              <div
                v-else
                class="opacity-50"
                title="Not Populated"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-gray-500"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
            </div>
          </div>

          <FixtureBase v-model:fixture="fixtureStore.fixtures[index]" />
        </NuxtLink>
      </div>
      <div
        v-else
        class="grid grid-cols-2 lg:grid-cols-5 gap-5"
      >
        <div
          v-for="i in 10"
          :key="i"
          class="bg-surface-50 border p-5"
        >
          <SkeletonFixture />
        </div>
      </div>
      <div
        v-if="draftedTeamsWithPoints?.length"
        class="grid w-full gap-5 lg:grid-cols-3"
      >
        <template
          v-for="draftedTeam in draftedTeamsWithPoints"
          :key="draftedTeam.drafted_team_id"
        >
          <DraftedTeamWithPoints
            :drafted-team="draftedTeam"
            :active-week="selectedWeek"
            :show-player-override="true"
            @calculated-weekly-stats="populateWeeklyStats"
          />
        </template>
      </div>
      <div
        v-else
        class="grid grid-cols-4 gap-5"
      >
        <template
          v-for="_ in 4"
          :key="_"
        >
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
