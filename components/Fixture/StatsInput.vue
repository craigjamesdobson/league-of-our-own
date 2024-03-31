<template>
  <TabView
    class="bg-surface-0 min-h-[480px]"
    :pt="{
      tabpanel: {
        headerTitle: {
          class: 'font-black'
        }
      }
    }"
  >
    <TabPanel
      v-for="(position, index) in playerPositions"
      :key="index"
      :header="position.key"
    >
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
        <Column class="w-4/12" field="web_name" header="Player"></Column>
        <Column class="w-2/12" header="Goals">
          <template #body="slotProps">
            <input
              v-model="slotProps.data.week_goals"
              class="w-16 rounded border p-1"
              type="number"
              min="0"
            />
          </template>
        </Column>
        <Column class="w-2/12" header="Assists">
          <template #body="slotProps">
            <input
              v-model="slotProps.data.week_assists"
              class="w-16 rounded border p-1"
              type="number"
              min="0"
            />
          </template>
        </Column>
        <Column class="w-2/12" field="quantity" header="Clean sheet">
          <template #body="slotProps">
            <input
              v-model="slotProps.data.week_cleansheet"
              :disabled="disableCleansheet"
              class="h-5 w-5"
              type="checkbox"
            />
          </template>
        </Column>
        <Column class="w-2/12" field="quantity" header="Red card">
          <template #body="slotProps">
            <input
              v-model="slotProps.data.week_redcard"
              class="h-5 w-5"
              type="checkbox"
            />
          </template>
        </Column>
      </DataTable>
    </TabPanel>
  </TabView>
</template>

<script setup lang="ts">
import { FilterMatchMode } from 'primevue/api';
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
