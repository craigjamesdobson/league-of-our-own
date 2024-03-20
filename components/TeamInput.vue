<template>
  <h2 class="font-black text-lg uppercase my-2">
    {{ team.name }}
  </h2>
  <button @click="console.log(players)">click</button>
  <TabView class="flex flex-col h-full">
    <TabPanel
      v-for="(position, index) in playerPositions"
      :key="index"
      :header="position.key"
    >
      <DataTable
        v-model:filters="filters"
        paginator
        :rows="5"
        :value="players.filter((x) => x.position === position.value)"
        size="small"
        :global-filter-fields="['web_name']"
        data-key="id"
      >
        <template #header>
          <div class="flex justify-end">
            <span class="relative flex items-center">
              <Icon
                size="20"
                class="absolute left-3 text-surface-400"
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
              class="p-1 border rounded w-16"
              type="number"
              min="0"
            />
          </template>
        </Column>
        <Column class="w-2/12" header="Assists">
          <template #body="slotProps">
            <input
              v-model="slotProps.data.week_assists"
              class="p-1 border rounded w-16"
              type="number"
              min="0"
            />
          </template>
        </Column>
        <Column class="w-2/12" field="quantity" header="Clean sheet">
          <template #body="slotProps">
            <Checkbox
              v-model="slotProps.data.week_clean_sheet"
              :binary="true"
            />
          </template>
        </Column>
        <Column class="w-2/12" field="quantity" header="Red card">
          <template #body="slotProps">
            <Checkbox v-model="slotProps.data.week_red_card" :binary="true" />
          </template>
        </Column>
      </DataTable>
    </TabPanel>
  </TabView>
</template>

<script setup lang="ts">
import { FilterMatchMode } from 'primevue/api';
import type { PlayerWithStats } from '~/types/Player';

interface Team {
  id: number;
  name: string;
  short_name: string;
}

const { team, players } = defineProps<{
  team: Team;
  players: PlayerWithStats[];
}>();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const playerPositions = [
  { key: 'GOALKEEPER', value: 1 },
  { key: 'DEFENDER', value: 2 },
  { key: 'MIDFIELDER', value: 3 },
  { key: 'FORWARD', value: 4 },
];
</script>
