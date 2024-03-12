<template>
  <div class="flex flex-col">
    <h2 class="font-black text-lg uppercase my-2">
      {{ fixture.home_team!.name }}
    </h2>
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
          :value="getFilteredPlayers(fixture.home_team.id, position.value)"
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
                v-model="slotProps.data.week_cleansheet"
                :binary="true"
              />
            </template>
          </Column>
          <Column class="w-2/12" field="quantity" header="Red card">
            <template #body="slotProps">
              <Checkbox v-model="slotProps.data.week_redcard" :binary="true" />
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>
  </div>
  <div>
    <h2 class="font-black text-lg uppercase my-2">
      {{ fixture.away_team.name }}
    </h2>
    <TabView>
      <TabPanel
        v-for="(position, index) in playerPositions"
        :key="index"
        :header="position.key"
      >
        <DataTable
          v-model:filters="filters"
          paginator
          :rows="5"
          :value="getFilteredPlayers(fixture.away_team.id, position.value)"
          size="small"
          :global-filter-fields="['web_name']"
          data-key="id"
        >
          <template #header>
            <div class="flex justify-end">
              <span class="relative">
                <Icon
                  size="18"
                  class="absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
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
                v-model="slotProps.data.week_cleansheet"
                :binary="true"
              />
            </template>
          </Column>
          <Column class="w-2/12" field="quantity" header="Red card">
            <template #body="slotProps">
              <Checkbox v-model="slotProps.data.week_redcard" :binary="true" />
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { usePlayerStore } from '~/stores/players';
import type { PlayerWithStats } from '~/types/Player';
import type { PlayerPosition } from '~/types/PlayerPosition';

const playerStore = usePlayerStore();

interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface Fixture {
  id: number;
  home_team: Team;
  away_team: Team;
}

const { fixture } = defineProps<{
  fixture: Fixture;
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

const getFilteredPlayers = (
  teamID: number,
  position: PlayerPosition
): PlayerWithStats[] => {
  const filteredPlayers = [...playerStore.players].filter(
    (x) => x.team === teamID && x.position === position
  );

  filteredPlayers.forEach((player: PlayerWithStats) => {
    player.week_goals = 0;
    player.week_assists = 0;
    player.week_redcard = false;
    player.week_cleansheet = false;
  });

  return filteredPlayers;
};
</script>

<style scoped></style>
