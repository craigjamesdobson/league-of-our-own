<script lang="ts" setup>
import { useTableStore } from '@/stores/table';

const route = useRoute();
const router = useRouter();
const tableStore = useTableStore();
const weeks = ref(Array.from({ length: 38 }, (_, index) => index + 1));
const selectedWeek = ref(+route.query.week || 1);

watch(selectedWeek, async (newWeek) => {
  if (tableStore.weeklyWinners?.find(x => x.week === newWeek).points !== null) {
    await tableStore.fetchWeeklyStats(newWeek);
  } else {
    tableStore.weeklyData = [];
  }
  await router.push({
    path: 'table',
    query: { week: newWeek }
  });
}, { immediate: true });
</script>

<template>
  <div class="flex flex-col lg:grid lg:grid-cols-6 lg:gap-10">
    <div class="lg:col-span-4 mb-5">
      <div class="flex justify-between">
        <h1 class="mb-5 text-2xl font-black uppercase">
          Week {{ selectedWeek }}
        </h1>
        <div class="mb-5 flex flex-col items-end gap-2.5">
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
          </div>
        </div>
      </div>
      <div
        class="lg:hidden bg-blue-600/10 border border-blue-600 p-2.5 text-blue-600 flex justify-between rounded mb-5">
        <span>Swipe table to view full details</span>
        <Icon class="ml-2.5 w-5 h-5" name="ic:outline-swipe" />
      </div>
      <DataTable v-if="tableStore.weeklyData?.length" scrollable striped-rows :value="tableStore.weeklyData">
        <Column field="index">
          <template #header="">
            <div v-tooltip.click.top="'Current Position'">Pos.</div>
          </template>
          <template #body="slotProps">
            <div>{{ slotProps.index + 1 }}</div>
          </template>
        </Column>
        <Column field="prev_week_position">
          <template #header>
            <div v-tooltip.top="'Previous Position'" class="whitespace-nowrap">
              Prv Pos.
            </div>
          </template>
          <template #body="slotProps">
            <div v-if="!!slotProps.data.prev_week_position" class="grid grid-cols-[35px_auto]">
              <div>{{ slotProps.data.prev_week_position }}</div>
              <div v-if="slotProps.data.prev_week_position < slotProps.index + 1">
                <Icon size="16" class="text-red-500" name="flowbite:caret-down-solid" />
              </div>
              <div v-if="slotProps.data.prev_week_position > slotProps.index + 1">
                <Icon size="16" class="text-green-500" name="flowbite:caret-up-solid" />
              </div>
              <div v-if="slotProps.data.prev_week_position === slotProps.index + 1">
                <Icon size="20" class="text-primary" name="radix-icons:dot-filled" />
              </div>
            </div>
            <div v-else>N/A</div>
          </template>
        </Column>
        <Column field="team_name" header="Team">
          <template #body="slotProps">
            <div class="flex flex-col gap-1 uppercase">
              <div class="font-black lg:text-base">
                {{ slotProps.data.team_name }}
              </div>
              <div class="text-xs">{{ slotProps.data.team_owner }}</div>
            </div>
          </template>
        </Column>
        <Column field="goals" header="Goals"></Column>
        <Column field="assists" header="Assists"></Column>
        <Column field="clean_sheets">
          <template #header>
            <div v-tooltip.top="'Total clean sheets'">CS.</div>
          </template>
        </Column>
        <Column field="red_cards">
          <template #header>
            <div v-tooltip.top="'Total red cards'">RC.</div>
          </template>
        </Column>
        <Column field="week_points">
          <template #header>
            <div v-tooltip.top="'Weekly points total'" class="whitespace-nowrap">
              Wk Pts.
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex items-center gap-2.5">
              <div>{{ slotProps.data.week_points }}</div>
              <Icon v-if="slotProps.data.weekly_winner" size="16" class="text-yellow-500" name="tabler:star-filled" />
            </div>
          </template>
        </Column>
        <Column field="total_points">
          <template #header>
            <div v-tooltip.top="'Total Points'" class="whitespace-nowrap">
              Tot Pts.
            </div>
          </template>
        </Column>
      </DataTable>
      <SkeletonTable v-else />
    </div>
    <div class="flex flex-col gap-2.5 lg:col-span-2">
      <WeeklyWinners />
    </div>
  </div>
</template>
