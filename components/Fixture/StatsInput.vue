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
