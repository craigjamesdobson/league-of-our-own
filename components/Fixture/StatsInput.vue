<template>
  <TabView class="bg-surface-0 min-h-[480px]">
    <TabPanel v-for="(position, index) in playerPositions" :key="index">
      <template #header>
        <div class="align-items-center flex gap-2">
          <span class="white-space-nowrap font-black">{{ position.key }}</span>
        </div>
      </template>
      <DataTable
        v-model:filters="filters"
        scrollable
        scroll-height="290px"
        :value="players!.filter((x) => x.position === position.value)"
        size="small"
        :global-filter-fields="['web_name']"
        data-key="id"
        :pt="{
          column: {
            headercontent: {
              class: 'font-bold uppercase text-xs py-2.5'
            }
          }
        }"
      >
        <template #header>
          <div class="flex justify-end">
            <span class="relative flex items-center">
              <Icon
                size="20"
                class="text-surface-400 absolute left-3"
                name="mdi:person-search-outline"
              />
              <InputText
                v-model="filters['global'].value"
                placeholder="Player Search"
                class="pl-10"
              />
            </span>
          </div>
        </template>
        <Column class="w-[20%]" field="web_name" header="Player"></Column>
        <Column class="w-[10%]" header="Goals">
          <template #body="slotProps">
            <input
              v-model="slotProps.data.week_goals"
              class="w-16 rounded border p-1"
              type="number"
              min="0"
              :class="{
                'bg-green-500 text-white': slotProps.data.week_goals > 0
              }"
              @click="calculatePlayerPoints(slotProps.data)"
            />
          </template>
        </Column>
        <Column class="w-[10%]" header="Assists">
          <template #body="slotProps">
            <input
              v-model="slotProps.data.week_assists"
              class="w-16 rounded border p-1"
              type="number"
              min="0"
              :class="{
                'bg-green-500 text-white': slotProps.data.week_assists > 0
              }"
              @click="calculatePlayerPoints(slotProps.data)"
            />
          </template>
        </Column>
        <Column class="w-[10%]" header="Clean sheet">
          <template #body="slotProps">
            <Checkbox
              v-model="slotProps.data.week_cleansheet"
              :disabled="disableCleansheet"
              :binary="true"
              @change="calculatePlayerPoints(slotProps.data)"
            />
          </template>
        </Column>
        <Column class="w-[10%]" header="Red card">
          <template #body="slotProps">
            <Checkbox
              v-model="slotProps.data.week_redcard"
              :pt-options="{ mergeProps: true }"
              :pt:box:class="{
                '!bg-red-600 border-red-600': slotProps.data.week_redcard,
                'peer-hover:!border-red-600': true
              }"
              :binary="true"
              @change="calculatePlayerPoints(slotProps.data)"
            />
          </template>
        </Column>
        <Column class="w-[10%]" field="week_points" header="Points" />
      </DataTable>
    </TabPanel>
  </TabView>
</template>

<script setup lang="ts">
import { FilterMatchMode } from 'primevue/api';
import type { PlayerWithStats } from '~/types/Player';
import { PlayerPosition } from '~/types/PlayerPosition';

const players = defineModel<PlayerWithStats[]>('players');

const { disableCleansheet } = defineProps<{
  disableCleansheet: boolean;
}>();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const calculatePlayerPoints = (player: PlayerWithStats) => {
  const POINTS_RED_CARD = -10;
  const POINTS_GOALKEEPER_CLEAN_SHEET = 5;
  const POINTS_DEFENDER_CLEAN_SHEET = 2;
  const POINTS_PER_GOAL: { [key: string]: number } = {
    [PlayerPosition.GOALKEEPER]: 10,
    [PlayerPosition.DEFENDER]: 7,
    [PlayerPosition.MIDFIELDER]: 5,
    [PlayerPosition.FORWARD]: 3
  };
  const POINTS_TWO_GOALS_BONUS = 5;
  const POINTS_THREE_OR_MORE_GOALS_BONUS = 10;
  const POINTS_PER_ASSIST = 3;

  if (!player || !player.position) {
    throw new Error('Invalid player data');
  }

  let totalPoints = 0;

  // Red Card
  if (player.week_redcard) {
    totalPoints += POINTS_RED_CARD;
  }

  // Clean Sheet
  if (player.week_cleansheet) {
    if (player.position === PlayerPosition.GOALKEEPER) {
      totalPoints += POINTS_GOALKEEPER_CLEAN_SHEET;
    } else if (player.position === PlayerPosition.DEFENDER) {
      totalPoints += POINTS_DEFENDER_CLEAN_SHEET;
    }
  }

  // Goals
  const pointsPerGoal = POINTS_PER_GOAL[player.position] || 0;
  totalPoints += player.week_goals * pointsPerGoal;

  // Goal Bonuses
  if (player.week_goals === 2) {
    totalPoints += POINTS_TWO_GOALS_BONUS;
  } else if (player.week_goals >= 3) {
    totalPoints += POINTS_THREE_OR_MORE_GOALS_BONUS;
  }

  // Assists
  totalPoints += player.week_assists * POINTS_PER_ASSIST;

  player.week_points = totalPoints;
};

const playerPositions = [
  { key: 'GOALKEEPER', value: 1 },
  { key: 'DEFENDER', value: 2 },
  { key: 'MIDFIELDER', value: 3 },
  { key: 'FORWARD', value: 4 }
];
</script>
