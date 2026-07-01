<script lang="ts" setup>
import { useTableStore } from '@/stores/table';
import { useDraftedTeamsStore } from '~/stores/draftedTeams';
import type { WeeklyWinners } from '~/types/Table';

const draftedTeamsStore = useDraftedTeamsStore();
const route = useRoute();
const router = useRouter();
const tableStore = useTableStore();
const weeks = ref(Array.from({ length: 38 }, (_, index) => index + 1));
const selectedWeek = ref(Number(route.query.week || 1));
const selectedDraftedTeam = ref();
const draftedTeamsWithPoints = ref();

watch(selectedWeek, async (newWeek) => {
  if (tableStore.weeklyWinners?.find((x: WeeklyWinners) => x.week === newWeek)?.points !== null) {
    await tableStore.fetchWeeklyStats(newWeek);
    draftedTeamsWithPoints.value
      = await draftedTeamsStore.fetchDraftedTeamsWithPlayerPointsByGameweek(
        newWeek,
      );
  }
  else {
    tableStore.weeklyData = [];
  }
  await router.push({
    path: 'table',
    query: { week: newWeek },
  });
}, { immediate: true });

const visible = ref(false);
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-6 lg:gap-10">
    <div class="lg:col-span-4 mb-5">
      <div class="flex justify-between">
        <h1 class="mb-5 text-2xl font-black uppercase">
          Week {{ selectedWeek }}
        </h1>
        <div class="mb-5 flex flex-col items-end gap-2.5">
          <label
            class="font-bold uppercase"
            for="gameweeks"
          >Select a game week</label>
          <div class="flex gap-2.5">
            <USelectMenu
              v-model="selectedWeek"
              :items="weeks"
              placeholder="Select a gameweek"
            >
              <template #default="{ modelValue }">
                <div class="flex items-center">
                  <div>WEEK {{ modelValue }}</div>
                </div>
              </template>
              <template #item-label="{ item }">
                <div class="flex items-center">
                  <div>WEEK {{ item }}</div>
                </div>
              </template>
            </USelectMenu>
          </div>
        </div>
      </div>
      <div
        class="lg:hidden bg-blue-600/10 border border-blue-600 p-2.5 text-blue-600 flex justify-between rounded mb-5"
      >
        <span>Swipe table to view full details</span>
        <Icon
          class="ml-2.5 w-5 h-5"
          name="ic:outline-swipe"
        />
      </div>
      <TableData
        v-if="tableStore.weeklyData?.length"
        v-model:selected-drafted-team="selectedDraftedTeam"
        v-model:visible="visible"
        :weekly-data="tableStore.weeklyData"
        :drafted-teams-with-points="draftedTeamsWithPoints"
      />
      <UAlert
        v-else
        color="info"
        variant="soft"
        description="This week is not yet available"
      />
    </div>
    <UModal
      v-model:open="visible"
      :title="`Week ${selectedWeek} score`"
      :dismissible="true"
      :ui="{
        overlay: 'bg-slate-950/75',
        content: 'w-[90%] bg-white text-slate-900 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 sm:max-w-[500px]',
        body: 'p-0 pb-2',
        title: 'uppercase',
      }"
    >
      <template #body>
        <DraftedTeamWithPoints
          :active-week="selectedWeek"
          :drafted-team="selectedDraftedTeam"
        />
        <CommonCalculationsLegend />
        <UAlert
          class="mx-4 my-1"
          color="info"
          variant="soft"
        >
          <template #description>
            See the <NuxtLink
              class="underline"
              to="/rules"
            >rules</NuxtLink> for a
            full breakdown of score calculations
          </template>
        </UAlert>
      </template>
    </UModal>
    <div class="flex flex-col gap-2.5 lg:col-span-2">
      <WeeklyWinners />
    </div>
  </div>
</template>
