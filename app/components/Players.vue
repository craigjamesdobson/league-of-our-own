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
const isMobile = ref(false);
const showMobileFilters = ref(false);
const multiSortMeta = ref<Array<{ field: string; order: 1 | -1 }>>([
  { field: 'season_points', order: -1 },
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

type SortMeta = { field: string; order: 1 | -1 };

const mobileSortOptions: Array<{ label: string; value: SortMeta }> = [
  { label: 'Points (high–low)', value: { field: 'season_points', order: -1 } },
  { label: 'Cost (high–low)', value: { field: 'cost', order: -1 } },
  { label: 'Cost (low–high)', value: { field: 'cost', order: 1 } },
  { label: 'Goals', value: { field: 'season_goals', order: -1 } },
  { label: 'Assists', value: { field: 'season_assists', order: -1 } },
];

const mobileSortField = ref<SortMeta>(mobileSortOptions[0]!.value);

const applyMobileSort = () => {
  multiSortMeta.value = [mobileSortField.value];
};

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
  isMobile.value = window.innerWidth < 768;
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
    <div class="mb-4 flex flex-col gap-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex flex-col gap-2">
          <h1 class="main-heading">
            Players
          </h1>
          <Message
            severity="info"
            size="small"
            class="hidden md:flex"
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
        </div>
        <div class="flex items-center gap-2">
          <Button
            class="!h-10 md:hidden"
            outlined
            @click="showMobileFilters = true"
          >
            <Icon
              name="mdi:filter"
              size="16"
            />
            <span class="ml-1.5">Filters</span>
          </Button>
          <Select
            v-model="mobileSortField"
            :options="mobileSortOptions"
            option-label="label"
            option-value="value"
            class="md:hidden"
            @change="applyMobileSort"
          />
          <Button
            class="!h-10"
            label="Clear filters"
            outlined
            @click="clearFilters"
          />
        </div>
      </div>
      <div class="md:hidden bg-surface-50 border border-surface-200 p-2.5 text-surface-600 flex justify-between rounded text-sm">
        <span>Tap any player to view full details</span>
        <Icon
          class="ml-2.5 w-5 h-5"
          name="mdi:gesture-tap"
        />
      </div>
    </div>

    <Drawer
      v-model:visible="showMobileFilters"
      header="Filter Players"
      position="bottom"
      class="md:hidden"
      style="border-radius: 12px 12px 0 0; height: auto"
    >
      <div class="flex flex-col gap-4 pb-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-surface-700">Name</label>
          <InputText
            v-model="filters.web_name.value"
            placeholder="Filter name"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-surface-700">Team</label>
          <MultiSelect
            v-model="filters.team_short_name.value"
            :options="teamOptions"
            option-label="label"
            option-value="value"
            placeholder="All teams"
            display="chip"
            show-clear
          >
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
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-surface-700">Position</label>
          <Select
            v-model="filters.position.value"
            :options="POSITION_OPTIONS"
            option-label="label"
            option-value="value"
            placeholder="All positions"
            show-clear
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-surface-700">Max cost</label>
          <Select
            v-model="filters.cost.value"
            :options="costOptions"
            option-label="label"
            option-value="value"
            placeholder="Up to cost..."
            show-clear
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-surface-700">Availability</label>
          <Select
            v-model="filters.availability.value"
            :options="availabilityOptions"
            option-label="label"
            option-value="value"
            placeholder="All"
            show-clear
          />
        </div>
        <Button
          label="Done"
          class="mt-2"
          @click="showMobileFilters = false"
        />
      </div>
    </Drawer>

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
      :scrollable="!isMobile"
      paginator
      :rows="25"
      class="players-table"
      striped-rows
      @row-select="onRowSelect"
      @row-click="onRowClick"
    >
      <Column
        :header-class="'md:hidden'"
        :body-class="'md:hidden w-full p-0'"
      >
        <template #header>
          <span class="sr-only">Player</span>
        </template>
        <template #body="slotProps">
          <div class="player-card py-2 px-2">
            <div class="flex items-center gap-3">
              <img
                class="w-10 h-10 rounded-full shrink-0 shadow-sm"
                :src="slotProps.data.image"
                :alt="slotProps.data.web_name"
                @error="loadPlayerFallbackImage"
              >
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex flex-col leading-tight">
                    <span class="text-xs text-surface-500 truncate">{{ slotProps.data.first_name }}</span>
                    <span class="font-semibold truncate">{{ slotProps.data.second_name }}</span>
                  </div>
                  <Tag
                    :value="getAvailabilityInfo(slotProps.data).label"
                    :severity="getAvailabilityInfo(slotProps.data).severity"
                    class="shrink-0 text-xs"
                  />
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                  <img
                    class="h-4 w-4"
                    :src="getImageUrl(slotProps.data.team_short_name.toLowerCase())"
                    :alt="slotProps.data.team_short_name"
                  >
                  <span class="text-xs text-surface-600">{{ slotProps.data.team_short_name }}</span>
                  <span class="text-surface-400 text-xs">·</span>
                  <Icon
                    :name="getPositionInfo(slotProps.data.position).icon"
                    size="13"
                  />
                  <span class="text-xs text-surface-600">{{ getPositionName(slotProps.data.position) }}</span>
                </div>
              </div>
            </div>
            <div class="mt-2 flex items-center justify-between border-t border-surface-100 pt-2">
              <div class="flex flex-col items-center">
                <span class="text-[10px] uppercase text-surface-400 tracking-wide">Cost</span>
                <span class="text-sm font-bold">£{{ slotProps.data.cost.toFixed(1) }}</span>
              </div>
              <div class="h-6 w-px bg-surface-200" />
              <div class="flex flex-col items-center">
                <span class="text-[10px] uppercase text-surface-400 tracking-wide">Pts</span>
                <span class="text-sm font-bold text-primary-500">{{ slotProps.data.season_points }}</span>
              </div>
              <div class="h-6 w-px bg-surface-200" />
              <div class="flex flex-col items-center">
                <span class="text-[10px] uppercase text-surface-400 tracking-wide">Goals</span>
                <span class="text-sm font-semibold">{{ slotProps.data.season_goals }}</span>
              </div>
              <div class="h-6 w-px bg-surface-200" />
              <div class="flex flex-col items-center">
                <span class="text-[10px] uppercase text-surface-400 tracking-wide">Assists</span>
                <span class="text-sm font-semibold">{{ slotProps.data.season_assists }}</span>
              </div>
            </div>
          </div>
        </template>
      </Column>
      <Column
        header="Player"
        sortable
        sort-field="web_name"
        filter-field="web_name"
        :show-filter-match-modes="false"
        style="min-width: 200px"
        :header-class="'hidden md:table-cell'"
        :body-class="'hidden md:table-cell'"
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
        :header-class="'hidden md:table-cell'"
        :body-class="'hidden md:table-cell'"
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
        :header-class="'hidden md:table-cell'"
        :body-class="'hidden md:table-cell'"
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
        :header-class="'hidden md:table-cell text-right'"
        :body-class="'hidden md:table-cell text-right'"
      >
        <template #body="slotProps">
          £{{ slotProps.data.cost.toFixed(1) }}
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
        :header-class="'hidden md:table-cell text-right'"
        :body-class="'hidden md:table-cell text-right'"
      >
        <template #body="slotProps">
          <span class="font-semibold text-primary-500">{{ slotProps.data.season_points }}</span>
        </template>
      </Column>
      <Column
        field="season_goals"
        header="Goals"
        sortable
        :header-class="'hidden md:table-cell text-right'"
        :body-class="'hidden md:table-cell text-right'"
      />
      <Column
        field="season_assists"
        header="Assists"
        sortable
        :header-class="'hidden md:table-cell text-right'"
        :body-class="'hidden md:table-cell text-right'"
      />
      <Column
        field="availability"
        header="Availability"
        :show-filter-match-modes="false"
        :header-class="'hidden md:table-cell'"
        :body-class="'hidden md:table-cell'"
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

<style scoped>
@media (min-width: 768px) {
  :deep(.p-datatable-tbody > tr) {
    cursor: pointer;
  }
}

@media (max-width: 767px) {
  :deep(.p-datatable-wrapper) {
    overflow-x: visible;
  }

  :deep(.p-datatable-table) {
    min-width: unset !important;
    width: 100%;
  }

  :deep(.p-datatable-tbody > tr > td.md\:hidden) {
    width: 100%;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>
