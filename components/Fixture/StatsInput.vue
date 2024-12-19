<template>
  <Tabs value="0">
    <TabList>
      <Tab v-for="(position, index) in playerPositions" :key="index" :value="position.value">{{ position.key }}</Tab>
    </TabList>
    <TabPanels class="min-h-[375px]">
      <TabPanel v-for="(position, index) in playerPositions" :key="index" :value="position.value">
        <DataTable scrollable scroll-height="290px"
          :value="players!.filter((x) => x.position === position.value)">
          <Column class="w-[20%]" field="web_name" header="Player"></Column>
          <Column class="w-[10%]" header="Goals">
            <template #body="slotProps">
              <input v-model="slotProps.data.week_goals" class="w-16 rounded border p-1" type="number" min="0" :class="{
                'bg-green-500 text-white': slotProps.data.week_goals > 0
              }" @click="calculatePlayerPoints(slotProps.data)" />
            </template>
          </Column>
          <Column class="w-[10%]" header="Assists">
            <template #body="slotProps">
              <input v-model="slotProps.data.week_assists" class="w-16 rounded border p-1" type="number" min="0" :class="{
                'bg-green-500 text-white': slotProps.data.week_assists > 0
              }" @click="calculatePlayerPoints(slotProps.data)" />
            </template>
          </Column>
          <Column class="w-[10%]" header="Clean sheet">
            <template #body="slotProps">
              <Checkbox v-model="slotProps.data.week_cleansheet" :disabled="disableCleansheet" :binary="true"
                @change="calculatePlayerPoints(slotProps.data)" />
            </template>
          </Column>
          <Column class="w-[10%]" header="Red card">
            <template #body="slotProps">
              <Checkbox v-model="slotProps.data.week_redcard" :pt-options="{ mergeProps: true }" :pt:box:class="{
                '!bg-red-600 border-red-600': slotProps.data.week_redcard,
                'peer-hover:!border-red-600': true
              }" :binary="true" @change="calculatePlayerPoints(slotProps.data)" />
            </template>
          </Column>
          <Column class="w-[10%]" field="week_points" header="Points" />
        </DataTable>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { calculatePlayerPoints } from '~/logic/fixtures';
import type { PlayerWithStats } from '~/types/Player';

const players = defineModel<PlayerWithStats[]>('players');

const { disableCleansheet } = defineProps<{
  disableCleansheet: boolean;
}>();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const playerPositions = [
  { key: 'GOALKEEPER', value: 1 },
  { key: 'DEFENDER', value: 2 },
  { key: 'MIDFIELDER', value: 3 },
  { key: 'FORWARD', value: 4 }
];
</script>
