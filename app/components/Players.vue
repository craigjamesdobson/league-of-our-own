<script lang="ts" setup>
import { FilterMatchMode } from '@primevue/core/api';
import { usePlayerStore } from '@/stores/players';
import { TEAM_DATA } from '@/logic/teams/constants';
import { POSITION_OPTIONS } from '@/logic/players/constants';
import { getImageUrl, loadPlayerFallbackImage } from '@/utils/images';
import { getPositionInfo, getPositionName } from '@/utils/playerPosition';
import type { PlayerSeasonStats } from '~/types/Player';

const router = useRouter();
const route = useRoute();
const playerStore = usePlayerStore();
const selectedPlayer = ref<PlayerSeasonStats | null>(null);
const showDialog = ref(false);
const multiSortMeta = ref([
  { field: 'season_points', order: -1 as const },
]);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  web_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  team_short_name: { value: null, matchMode: FilterMatchMode.IN },
  position: { value: null, matchMode: FilterMatchMode.EQUALS },
  cost: { value: null, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
  availability: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const globalFilterFields = [
  'web_name',
  'team_short_name',
  'team_name',
  'position',
];

const availabilityOptions = [
  { label: 'Available', value: 'available' },
  { label: 'Unavailable', value: 'unavailable' },
  { label: 'Out for season', value: 'out_for_season' },
];

const teamOptions = TEAM_DATA.map(team => ({
  label: team.name,
  value: team.short_name,
  badge: team.short_name.toLowerCase(),
}));

const costOptions = Array.from({ length: 23 }, (_, index) => {
  const value = 4 + (index * 0.5);
  return {
    label: value.toFixed(1),
    value,
  };
});

const getAvailabilityStatus = (player: PlayerSeasonStats): string => {
  if (player.unavailable_for_season) {
    return 'out_for_season';
  }

  if (player.is_unavailable) {
    return 'unavailable';
  }

  return 'available';
};

const getAvailabilityInfo = (player: PlayerSeasonStats) => {
  if (player.unavailable_for_season) {
    return { label: 'Out for season', severity: 'danger' as const };
  }

  if (player.is_unavailable) {
    return { label: 'Unavailable', severity: 'warn' as const };
  }

  return { label: 'Available', severity: 'success' as const };
};

// Augment players with availability status field for filtering
const playersWithAvailability = computed(() => {
  return playerStore.getPlayersWithSeasonStats.map(player => ({
    ...player,
    availability: getAvailabilityStatus(player),
  }));
});

const setSelectedPlayerAndQueryParam = (playerID: number) => {
  selectedPlayer.value = playerStore.getPlayersWithSeasonStats
    .find(player => player.player_id === playerID) ?? null;
  router.push({
    path: 'players',
    query: { id: playerID },
  });
  showDialog.value = true;
};

const clearFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    web_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    team_short_name: { value: null, matchMode: FilterMatchMode.IN },
    position: { value: null, matchMode: FilterMatchMode.EQUALS },
    cost: { value: null, matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
    availability: { value: null, matchMode: FilterMatchMode.EQUALS },
  };
};

const onRowSelect = (event: { data: PlayerSeasonStats }) => {
  setSelectedPlayerAndQueryParam(event.data.player_id);
};

const onRowClick = (event: { data: PlayerSeasonStats }) => {
  setSelectedPlayerAndQueryParam(event.data.player_id);
};

onMounted(async () => {
  const playerId = route.query.id;
  if (playerId && typeof playerId === 'string') {
    selectedPlayer.value = playerStore.getPlayersWithSeasonStats
      .find(player => player.player_id === +playerId) ?? null;
    showDialog.value = true;
  }
});
</script>

<template>
  <SkeletonPlayers v-if="!playerStore.isLoaded" />
  <div
    v-else
    class="grid grid-cols-1"
  >
    <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div class="flex flex-col gap-2">
        <h1 class="main-heading">
          Players
        </h1>
        <div class="flex flex-col gap-2">
          <Message
            severity="info"
            size="small"
          >
            <template #icon>
              <Icon
                class="flex-shrink-0"
                size="18"
                name="mdi:information"
              />
            </template>
            Select a row to view player details. Use column menus to filter. Click a header to sort, hold meta/ctrl to multi-sort.
          </Message>
          <div class="lg:hidden bg-blue-600/10 border border-blue-600 p-2.5 text-blue-600 flex justify-between rounded">
            <span>Swipe table to view full details</span>
            <Icon
              class="ml-2.5 w-5 h-5"
              name="ic:outline-swipe"
            />
          </div>
        </div>
      </div>
      <Button
        class="!h-10"
        label="Clear filters"
        outlined
        @click="clearFilters"
      />
    </div>
    <PlayerModal
      v-model="showDialog"
      :selected-player="selectedPlayer"
    />
    <DataTable
      v-model:filters="filters"
      v-model:multi-sort-meta="multiSortMeta"
      :value="playersWithAvailability"
      filter-display="menu"
      :global-filter-fields="globalFilterFields"
      sort-mode="multiple"
      :default-sort-order="-1"
      removable-sort
      data-key="player_id"
      scrollable
      paginator
      :rows="25"
      class="players-table"
      @row-select="onRowSelect"
      @row-click="onRowClick"
    >
      <Column
        field="player_id"
        header="ID"
        sortable
        :header-class="'hidden md:table-cell'"
        :body-class="'hidden md:table-cell'"
      />
      <Column
        header="Player"
        sortable
        sort-field="web_name"
        filter-field="web_name"
        :show-filter-match-modes="false"
        style="min-width: 200px"
      >
        <template #body="slotProps">
          <div class="flex items-center gap-3">
            <img
              class="w-10 rounded-full shadow-sm"
              :src="slotProps.data.image"
              :alt="slotProps.data.web_name"
              @error="loadPlayerFallbackImage"
            >
            <div class="flex flex-col">
              <span class="text-xs text-surface-500">
                {{ slotProps.data.first_name }}
              </span>
              <span class="font-semibold leading-tight">
                {{ slotProps.data.second_name }}
              </span>
            </div>
          </div>
        </template>
        <template #filter="slotProps">
          <InputText
            v-model="slotProps.filterModel.value"
            placeholder="Filter name"
            class="p-column-filter"
            @input="slotProps.filterCallback()"
          />
        </template>
        <template #filterclear="slotProps">
          <Button
            text
            size="small"
            label="Clear"
            @click="slotProps.filterCallback()"
          />
        </template>
      </Column>
      <Column
        field="team_short_name"
        header="Team"
        sortable
        :show-filter-match-modes="false"
        filter-match-mode="in"
      >
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <img
              class="h-5 w-5"
              :src="getImageUrl(slotProps.data.team_short_name.toLowerCase())"
              :alt="slotProps.data.team_short_name"
            >
            <span>{{ slotProps.data.team_short_name }}</span>
          </div>
        </template>
        <template #filter="slotProps">
          <MultiSelect
            v-model="slotProps.filterModel.value"
            :options="teamOptions"
            option-label="label"
            option-value="value"
            placeholder="Teams"
            class="p-column-filter"
            display="chip"
            show-clear
            @change="slotProps.filterCallback()"
          >
            <template #value="valueSlot">
              <div
                v-if="valueSlot.value && valueSlot.value.length"
                class="flex flex-wrap gap-1"
              >
                <span
                  v-for="team in valueSlot.value"
                  :key="team"
                  class="inline-flex items-center gap-1 rounded-md border border-surface-200 bg-surface-50 px-2 py-0.5 text-xs"
                >
                  <img
                    class="h-4 w-4"
                    :src="getImageUrl(team.toLowerCase())"
                    :alt="team"
                  >
                  {{ teamOptions.find(option => option.value === team)?.label }}
                </span>
              </div>
              <span v-else>
                {{ valueSlot.placeholder }}
              </span>
            </template>
            <template #option="optionSlot">
              <div class="flex items-center gap-2">
                <img
                  class="h-5 w-5"
                  :src="getImageUrl(optionSlot.option.badge)"
                  :alt="optionSlot.option.label"
                >
                <span>{{ optionSlot.option.label }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
        <template #filterclear="slotProps">
          <Button
            text
            size="small"
            label="Clear"
            @click="slotProps.filterCallback()"
          />
        </template>
      </Column>
      <Column
        field="position"
        header="Position"
        sortable
        :show-filter-match-modes="false"
      >
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <Icon
              :name="getPositionInfo(slotProps.data.position).icon"
              size="18"
            />
            <span>{{ getPositionName(slotProps.data.position) }}</span>
          </div>
        </template>
        <template #filter="slotProps">
          <Select
            v-model="slotProps.filterModel.value"
            :options="POSITION_OPTIONS"
            option-label="label"
            option-value="value"
            placeholder="Position"
            class="p-column-filter"
            show-clear
            @change="slotProps.filterCallback()"
          />
        </template>
        <template #filterclear="slotProps">
          <Button
            text
            size="small"
            label="Clear"
            @click="slotProps.filterCallback()"
          />
        </template>
      </Column>
      <Column
        field="cost"
        header="Cost"
        sortable
        data-type="numeric"
        :show-filter-operator="false"
        :show-add-button="false"
        :show-filter-match-modes="false"
        :show-apply-button="false"
        :show-clear-button="false"
      >
        <template #body="slotProps">
          {{ slotProps.data.cost.toFixed(1) }}
        </template>
        <template #filter="slotProps">
          <Select
            v-model="slotProps.filterModel.value"
            :options="costOptions"
            option-label="label"
            option-value="value"
            placeholder="Up to cost..."
            class="p-column-filter"
            show-clear
            @change="slotProps.filterCallback()"
          />
        </template>
        <template #filterclear="slotProps">
          <Button
            text
            size="small"
            label="Clear"
            @click="slotProps.filterCallback()"
          />
        </template>
      </Column>
      <Column
        field="season_points"
        header="Points"
        sortable
      />
      <Column
        field="season_goals"
        header="Goals"
        sortable
      />
      <Column
        field="season_assists"
        header="Assists"
        sortable
      />
      <Column
        field="availability"
        header="Availability"
        :show-filter-match-modes="false"
      >
        <template #body="slotProps">
          <Tag
            :value="getAvailabilityInfo(slotProps.data).label"
            :severity="getAvailabilityInfo(slotProps.data).severity"
          />
        </template>
        <template #filter="slotProps">
          <Select
            v-model="slotProps.filterModel.value"
            :options="availabilityOptions"
            option-label="label"
            option-value="value"
            placeholder="Availability"
            class="p-column-filter"
            show-clear
            @change="slotProps.filterCallback()"
          />
        </template>
        <template #filterclear="slotProps">
          <Button
            text
            size="small"
            label="Clear"
            @click="slotProps.filterCallback()"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
