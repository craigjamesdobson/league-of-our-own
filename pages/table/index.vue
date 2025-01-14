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
  <div class="grid lg:grid-cols-6 lg:gap-10">
    <div class="col-span-1 lg:col-span-4 mb-5">
      <div class="flex justify-between">
        <h1 class="mb-5 text-2xl font-black uppercase">
          Week {{ selectedWeek }}
        </h1>
        <div class="mb-5 flex flex-col items-end gap-2.5">
          <label class="font-bold uppercase" for="gameweeks">Select a game week</label>
          <div class="flex gap-2.5">
            <Select v-model="selectedWeek" :options="weeks" placeholder="Select a gameweek" scroll-height="25rem">
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
          </div>
        </div>
      </div>
      <div
        class="lg:hidden bg-blue-600/10 border border-blue-600 p-2.5 text-blue-600 flex justify-between rounded mb-5">
        <span>Swipe table to view full details</span>
        <Icon class="ml-2.5 w-5 h-5" name="ic:outline-swipe" />
      </div>
      <TableData :weekly-data="tableStore.weeklyData" :drafted-teams-with-points="draftedTeamsWithPoints"
        v-model:selected-drafted-team="selectedDraftedTeam" v-model:visible="visible" />
    </div>
    <Dialog v-model:visible="visible" class="w-[90%] sm:w-[500px]" pt:header:class="!items-start !pb-2"
      pt:title:class="uppercase !font-black" pt:content:class="!p-0 !pb-2" dismissable-mask modal
      :header="`Week ${selectedWeek} score`">
      <template #header>
        <div class="flex flex-col uppercase">
          <span class="text-sm font-black mb-2.5 pb-2.5 border-b">Week {{ selectedWeek }} score</span>
          <span class="text-lg font-black">{{
            selectedDraftedTeam?.team_name
            }}</span>
          <span class="text-xs font-light">{{
            selectedDraftedTeam?.team_owner
            }}</span>
        </div>
      </template>
      <DraftedTeamPreviewWithPoints :active-week="selectedWeek" :drafted-team="selectedDraftedTeam" />
      <CommonCalculationsLegend />
      <Message class="mx-4 my-1" severity="info">
        See the <NuxtLink class="underline" to="/rules">rules</NuxtLink> for a
        full
        breakdown of score calculations
      </Message>
    </Dialog>
    <div class="flex flex-col gap-2.5 lg:col-span-2">
      <WeeklyWinners />
    </div>
  </div>
</template>
