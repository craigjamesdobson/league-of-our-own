<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui';
import { usePlayerStore } from '@/stores/players';
import { TEAM_DATA } from '@/logic/teams/constants';
import { populateFilterPrices } from '@/utils/filters';
import { loadPlayerFallbackImage, getImageUrl } from '@/utils/images';
import { getPositionName } from '@/utils/playerPosition';
import type { Player } from '~/types/Player';
import { PlayerPosition } from '~/types/PlayerPosition';

const router = useRouter();
const route = useRoute();
const playerStore = usePlayerStore();
const selectedPlayer: Ref<Player | null> = ref(null);
const showDialog = ref(false);

type AvailabilityFilter = 'all' | 'available' | 'unavailable' | 'season';
type ColumnFiltersState = { id: string; value: unknown }[];
type SortingState = { id: string; desc: boolean }[];
type PlayerFilterRow = { original: Player };
type PlayerFilterFn = (row: PlayerFilterRow, columnId: string, filterValue: unknown) => boolean;
type TableColumnApi = {
  getCanSort: () => boolean;
  getIsSorted: () => false | 'asc' | 'desc';
  toggleSorting: (desc?: boolean) => void;
  setFilterValue: (value?: unknown) => void;
};
type PlayerTable = {
  tableApi: {
    getFilteredRowModel: () => {
      rows: unknown[];
    };
  };
};

const table = useTemplateRef<PlayerTable>('table');
const columnFilters = ref<ColumnFiltersState>([]);
const sorting = ref<SortingState>([]);

const normalizeFilterValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase();

const playerNameFilter: PlayerFilterFn = (row, _columnId, filterValue) => {
  const search = normalizeFilterValue(String(filterValue ?? '').trim());

  if (!search) {
    return true;
  }

  return normalizeFilterValue(row.original.web_name ?? '').includes(search);
};

const positionFilter: PlayerFilterFn = (row, _columnId, filterValue) => {
  return filterValue === null || filterValue === undefined || row.original.position === filterValue;
};

const teamFilter: PlayerFilterFn = (row, _columnId, filterValue) => {
  return !filterValue || row.original.team === filterValue;
};

const priceFilter: PlayerFilterFn = (row, _columnId, filterValue) => {
  return !filterValue || row.original.cost === filterValue;
};

const availabilityFilter: PlayerFilterFn = (row, _columnId, filterValue) => {
  switch (filterValue as AvailabilityFilter) {
    case 'available':
      return !row.original.is_unavailable;
    case 'unavailable':
      return row.original.is_unavailable && !row.original.unavailable_for_season;
    case 'season':
      return row.original.unavailable_for_season;
    default:
      return true;
  }
};

const columns: TableColumn<Player>[] = [
  { accessorKey: 'player_id', header: 'ID', meta: { class: { th: 'w-20 align-top' } } },
  { accessorKey: 'web_name', id: 'player', header: 'Player', filterFn: playerNameFilter, meta: { class: { th: 'min-w-64 align-top' } } },
  { accessorKey: 'goals_scored', id: 'goals', header: 'G', meta: { class: { th: 'w-20 align-top text-right' } } },
  { accessorKey: 'assists', id: 'assists', header: 'A', meta: { class: { th: 'w-20 align-top text-right' } } },
  { accessorKey: 'clean_sheets', id: 'clean_sheets', header: 'CS', meta: { class: { th: 'w-20 align-top text-right' } } },
  { accessorKey: 'red_cards', id: 'red_cards', header: 'RC', meta: { class: { th: 'w-20 align-top text-right' } } },
  { accessorKey: 'position', id: 'position', header: 'Pos.', filterFn: positionFilter, meta: { class: { th: 'w-32 align-top' } } },
  { accessorKey: 'team_short_name', id: 'team', header: 'Team', filterFn: teamFilter, meta: { class: { th: 'w-32' } } },
  { accessorKey: 'cost', id: 'cost', header: 'Cost', filterFn: priceFilter, meta: { class: { th: 'w-28 align-top text-right' } } },
  { accessorKey: 'is_unavailable', id: 'availability', header: 'Availability', filterFn: availabilityFilter, enableSorting: false, meta: { class: { th: 'w-44 align-top' } } },
];

const positionFilters = [
  { label: 'All positions', value: null },
  { label: getPositionName(PlayerPosition.GOALKEEPER), value: PlayerPosition.GOALKEEPER },
  { label: getPositionName(PlayerPosition.DEFENDER), value: PlayerPosition.DEFENDER },
  { label: getPositionName(PlayerPosition.MIDFIELDER), value: PlayerPosition.MIDFIELDER },
  { label: getPositionName(PlayerPosition.FORWARD), value: PlayerPosition.FORWARD },
] satisfies { label: string; value: PlayerPosition | null }[];

const availabilityFilters = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Flagged', value: 'unavailable' },
  { label: 'Season out', value: 'season' },
] satisfies { label: string; value: AvailabilityFilter }[];

const teamFilters = computed(() => [
  { name: 'All teams', value: 0 },
  ...TEAM_DATA.map(team => ({
    name: team.name,
    value: team.id,
  })),
]);

const priceFilters = populateFilterPrices();

const sortedPlayers = computed(() =>
  [...playerStore.getPlayers]
    .sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0) || a.player_id - b.player_id),
);

const filterSnapshot = computed(() => ({
  columnFilters: columnFilters.value,
  playerCount: sortedPlayers.value.length,
}));

const filteredRowCount = ref(0);

const updateFilteredRowCount = async () => {
  await nextTick();
  filteredRowCount.value = table.value?.tableApi.getFilteredRowModel().rows.length ?? sortedPlayers.value.length;
};

const activeFilterCount = computed(() => {
  return columnFilters.value.length;
});

const visibleRange = computed(() => {
  return `${filteredRowCount.value} players`;
});

const setSelectedPlayerAndQueryParam = (playerID: number) => {
  selectedPlayer.value = playerStore.getPlayerByID(playerID) as Player;
  router.push({
    path: '/players',
    query: { id: playerID },
  });
  showDialog.value = true;
};

const selectPlayerRow = (_event: Event, row: TableRow<Player>) => {
  setSelectedPlayerAndQueryParam(row.original.player_id);
};

const getAvailability = (player: Player) => {
  if (player.unavailable_for_season) {
    return {
      label: 'Season out',
      color: 'error' as const,
      icon: 'lucide:circle-x',
    };
  }

  if (player.is_unavailable) {
    return {
      label: 'Flagged',
      color: 'warning' as const,
      icon: 'lucide:circle-alert',
    };
  }

  return {
    label: 'Available',
    color: 'success' as const,
    icon: 'lucide:circle-check',
  };
};

const resetFilters = () => {
  columnFilters.value = [];
  sorting.value = [];
};

const getColumnFilterValue = (id: string) => {
  return columnFilters.value.find(filter => filter.id === id)?.value;
};

const getColumnFilterString = (id: string) => String(getColumnFilterValue(id) ?? '');

const getColumnFilterNumber = (id: string) => Number(getColumnFilterValue(id) ?? 0);

const getColumnFilterAvailability = () => (getColumnFilterValue('availability') ?? 'all') as AvailabilityFilter;

const isColumnFiltered = (id: string) => columnFilters.value.some(filter => filter.id === id);

const setColumnFilter = (column: TableColumnApi, value: unknown, emptyValue: unknown) => {
  column.setFilterValue(value === emptyValue ? undefined : value);
};

const cycleSorting = (column: TableColumnApi) => {
  const direction = column.getIsSorted();

  if (direction === 'asc') {
    column.toggleSorting(true);
    return;
  }

  if (direction === 'desc') {
    sorting.value = [];
    return;
  }

  column.toggleSorting(false);
};

const getSortIcon = (column: TableColumnApi) => {
  switch (column.getIsSorted()) {
    case 'asc':
      return 'lucide:arrow-up';
    case 'desc':
      return 'lucide:arrow-down';
    default:
      return 'lucide:arrow-up-down';
  }
};

onMounted(async () => {
  if (route.query.id) {
    selectedPlayer.value = playerStore.getPlayerByID(+route.query.id) as Player;
    showDialog.value = true;
  }
});

watch(filterSnapshot, updateFilteredRowCount, { deep: true, immediate: true, flush: 'post' });
</script>

<template>
  <SkeletonPlayers v-if="!playerStore.isLoaded" />
  <div
    v-else
    class="w-full"
  >
    <PlayerModal
      v-model="showDialog"
      :selected-player="selectedPlayer"
    />
    <div class="w-full rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Players
            </h1>
            <p class="text-sm text-slate-600 dark:text-slate-300">
              {{ visibleRange }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              icon="lucide:rotate-ccw"
              label="Reset"
              color="neutral"
              variant="ghost"
              size="sm"
              :disabled="activeFilterCount === 0"
              class="dark:!text-slate-100 dark:hover:!bg-slate-800"
              @click="resetFilters"
            />
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <UTable
          ref="table"
          v-model:column-filters="columnFilters"
          v-model:sorting="sorting"
          :data="sortedPlayers"
          :columns="columns"
          empty="No players found"
          :ui="{
            root: 'w-full min-w-full',
            base: 'w-full min-w-[1180px] text-sm',
            th: 'bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200',
            td: 'align-middle',
            tr: 'cursor-pointer even:bg-slate-50/70 hover:bg-slate-100 dark:even:bg-slate-800/50 dark:hover:bg-slate-800',
            empty: 'py-10 text-center text-slate-500 dark:text-slate-400',
          }"
          :on-select="selectPlayerRow"
        >
          <template #player_id-header="{ column }">
            <UButton
              label="ID"
              :icon="getSortIcon(column)"
              color="neutral"
              variant="ghost"
              size="xs"
              class="px-0 font-semibold dark:!text-slate-100"
              @click="cycleSorting(column)"
            />
          </template>

          <template #player-header="{ column }">
            <div class="flex min-w-56 items-center gap-1.5">
              <UButton
                label="Player"
                :icon="getSortIcon(column)"
                color="neutral"
                variant="ghost"
                size="xs"
                class="justify-start px-0 font-semibold dark:!text-slate-100"
                @click="cycleSorting(column)"
              />
              <UPopover :content="{ align: 'start' }">
                <UButton
                  icon="lucide:funnel"
                  :color="isColumnFiltered('player') ? 'primary' : 'neutral'"
                  :variant="isColumnFiltered('player') ? 'soft' : 'ghost'"
                  size="xs"
                  square
                  aria-label="Filter players"
                />
                <template #content>
                  <div class="w-64 space-y-3 p-3">
                    <UInput
                      :model-value="getColumnFilterString('player')"
                      class="w-full normal-case"
                      icon="tabler:search"
                      size="sm"
                      placeholder="Search players"
                      autofocus
                      @update:model-value="column.setFilterValue($event || undefined)"
                    />
                    <UButton
                      label="Clear"
                      icon="lucide:x"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :disabled="!isColumnFiltered('player')"
                      @click="column.setFilterValue(undefined)"
                    />
                  </div>
                </template>
              </UPopover>
            </div>
          </template>

          <template #goals-header="{ column }">
            <UTooltip text="Goals scored">
              <UButton
                label="G"
                :icon="getSortIcon(column)"
                color="neutral"
                variant="ghost"
                size="xs"
                class="ml-auto px-0 font-semibold dark:!text-slate-100"
                @click="cycleSorting(column)"
              />
            </UTooltip>
          </template>

          <template #assists-header="{ column }">
            <UTooltip text="Assists">
              <UButton
                label="A"
                :icon="getSortIcon(column)"
                color="neutral"
                variant="ghost"
                size="xs"
                class="ml-auto px-0 font-semibold dark:!text-slate-100"
                @click="cycleSorting(column)"
              />
            </UTooltip>
          </template>

          <template #clean_sheets-header="{ column }">
            <UTooltip text="Clean sheets">
              <UButton
                label="CS"
                :icon="getSortIcon(column)"
                color="neutral"
                variant="ghost"
                size="xs"
                class="ml-auto px-0 font-semibold dark:!text-slate-100"
                @click="cycleSorting(column)"
              />
            </UTooltip>
          </template>

          <template #red_cards-header="{ column }">
            <UTooltip text="Red cards">
              <UButton
                label="RC"
                :icon="getSortIcon(column)"
                color="neutral"
                variant="ghost"
                size="xs"
                class="ml-auto px-0 font-semibold dark:!text-slate-100"
                @click="cycleSorting(column)"
              />
            </UTooltip>
          </template>

          <template #position-header="{ column }">
            <div class="flex w-28 items-center gap-1.5">
              <UButton
                label="Pos."
                :icon="getSortIcon(column)"
                color="neutral"
                variant="ghost"
                size="xs"
                class="justify-start px-0 font-semibold dark:!text-slate-100"
                @click="cycleSorting(column)"
              />
              <UPopover :content="{ align: 'start' }">
                <UButton
                  icon="lucide:funnel"
                  :color="isColumnFiltered('position') ? 'primary' : 'neutral'"
                  :variant="isColumnFiltered('position') ? 'soft' : 'ghost'"
                  size="xs"
                  square
                  aria-label="Filter positions"
                />
                <template #content>
                  <div class="w-48 space-y-3 p-3">
                    <USelectMenu
                      :model-value="getColumnFilterNumber('position') || null"
                      class="w-full normal-case"
                      label-key="label"
                      value-key="value"
                      :items="positionFilters"
                      size="sm"
                      @update:model-value="setColumnFilter(column, $event, null)"
                    />
                    <UButton
                      label="Clear"
                      icon="lucide:x"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :disabled="!isColumnFiltered('position')"
                      @click="column.setFilterValue(undefined)"
                    />
                  </div>
                </template>
              </UPopover>
            </div>
          </template>

          <template #team-header="{ column }">
            <div class="flex w-32 items-center gap-1.5">
              <UButton
                label="Team"
                :icon="getSortIcon(column)"
                color="neutral"
                variant="ghost"
                size="xs"
                class="justify-start px-0 font-semibold dark:!text-slate-100"
                @click="cycleSorting(column)"
              />
              <UPopover :content="{ align: 'start' }">
                <UButton
                  icon="lucide:funnel"
                  :color="isColumnFiltered('team') ? 'primary' : 'neutral'"
                  :variant="isColumnFiltered('team') ? 'soft' : 'ghost'"
                  size="xs"
                  square
                  aria-label="Filter teams"
                />
                <template #content>
                  <div class="w-56 space-y-3 p-3">
                    <USelectMenu
                      :model-value="getColumnFilterNumber('team')"
                      class="w-full normal-case"
                      label-key="name"
                      value-key="value"
                      :items="teamFilters"
                      size="sm"
                      @update:model-value="setColumnFilter(column, $event, 0)"
                    />
                    <UButton
                      label="Clear"
                      icon="lucide:x"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :disabled="!isColumnFiltered('team')"
                      @click="column.setFilterValue(undefined)"
                    />
                  </div>
                </template>
              </UPopover>
            </div>
          </template>

          <template #cost-header="{ column }">
            <div class="ml-auto flex w-28 items-center justify-end gap-1.5">
              <UButton
                label="Cost"
                :icon="getSortIcon(column)"
                color="neutral"
                variant="ghost"
                size="xs"
                class="justify-end px-0 font-semibold dark:!text-slate-100"
                @click="cycleSorting(column)"
              />
              <UPopover :content="{ align: 'end' }">
                <UButton
                  icon="lucide:funnel"
                  :color="isColumnFiltered('cost') ? 'primary' : 'neutral'"
                  :variant="isColumnFiltered('cost') ? 'soft' : 'ghost'"
                  size="xs"
                  square
                  aria-label="Filter costs"
                />
                <template #content>
                  <div class="w-44 space-y-3 p-3">
                    <USelectMenu
                      :model-value="getColumnFilterNumber('cost')"
                      class="w-full normal-case"
                      label-key="name"
                      value-key="value"
                      :items="priceFilters"
                      size="sm"
                      @update:model-value="setColumnFilter(column, $event, 0)"
                    />
                    <UButton
                      label="Clear"
                      icon="lucide:x"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :disabled="!isColumnFiltered('cost')"
                      @click="column.setFilterValue(undefined)"
                    />
                  </div>
                </template>
              </UPopover>
            </div>
          </template>

          <template #availability-header="{ column }">
            <div class="flex w-40 items-center gap-1.5">
              <span class="font-semibold">Availability</span>
              <UPopover :content="{ align: 'start' }">
                <UButton
                  icon="lucide:funnel"
                  :color="isColumnFiltered('availability') ? 'primary' : 'neutral'"
                  :variant="isColumnFiltered('availability') ? 'soft' : 'ghost'"
                  size="xs"
                  square
                  aria-label="Filter availability"
                />
                <template #content>
                  <div class="w-52 space-y-3 p-3">
                    <USelectMenu
                      :model-value="getColumnFilterAvailability()"
                      class="w-full normal-case"
                      label-key="label"
                      value-key="value"
                      :items="availabilityFilters"
                      size="sm"
                      @update:model-value="setColumnFilter(column, $event, 'all')"
                    />
                    <UButton
                      label="Clear"
                      icon="lucide:x"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :disabled="!isColumnFiltered('availability')"
                      @click="column.setFilterValue(undefined)"
                    />
                  </div>
                </template>
              </UPopover>
            </div>
          </template>

          <template #player-cell="{ row }">
            <div class="flex items-center gap-3">
              <img
                class="h-9 w-9 rounded-full bg-white object-cover object-top shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                :src="row.original.image"
                :alt="row.original.web_name"
                @error="loadPlayerFallbackImage"
              >
              <div class="min-w-0">
                <div class="truncate font-semibold text-slate-900 dark:text-slate-100">
                  {{ row.original.web_name }}
                </div>
                <div
                  v-if="row.original.news"
                  class="max-w-72 truncate text-xs text-slate-500 dark:text-slate-400"
                >
                  {{ row.original.news }}
                </div>
              </div>
            </div>
          </template>

          <template #goals-cell="{ row }">
            <div class="text-right font-medium text-slate-700 dark:text-slate-200">
              {{ row.original.goals_scored }}
            </div>
          </template>

          <template #assists-cell="{ row }">
            <div class="text-right font-medium text-slate-700 dark:text-slate-200">
              {{ row.original.assists }}
            </div>
          </template>

          <template #clean_sheets-cell="{ row }">
            <div class="text-right font-medium text-slate-700 dark:text-slate-200">
              {{ row.original.clean_sheets }}
            </div>
          </template>

          <template #red_cards-cell="{ row }">
            <div class="text-right font-medium text-slate-700 dark:text-slate-200">
              {{ row.original.red_cards }}
            </div>
          </template>

          <template #position-cell="{ row }">
            <UBadge
              color="neutral"
              variant="soft"
              :label="getPositionName(row.original.position)"
            />
          </template>

          <template #team-cell="{ row }">
            <div class="flex items-center gap-2">
              <img
                class="h-6 w-6"
                :src="getImageUrl(row.original.team_short_name.toLowerCase())"
                :alt="row.original.team_short_name"
              >
              <span class="font-medium text-slate-700 dark:text-slate-200">
                {{ row.original.team_short_name }}
              </span>
            </div>
          </template>

          <template #cost-cell="{ row }">
            <div class="text-right font-semibold text-slate-900 dark:text-slate-100">
              {{ row.original.cost.toFixed(1) }}
            </div>
          </template>

          <template #availability-cell="{ row }">
            <UTooltip :text="row.original.news || getAvailability(row.original).label">
              <UBadge
                :color="getAvailability(row.original).color"
                variant="soft"
                :icon="getAvailability(row.original).icon"
                :label="getAvailability(row.original).label"
              />
            </UTooltip>
          </template>
        </UTable>
      </div>

      <div class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <span class="text-slate-600 dark:text-slate-300">
          {{ visibleRange }}
        </span>
        <span class="text-slate-600 dark:text-slate-300">
          {{ activeFilterCount }} active filters
        </span>
      </div>
    </div>
  </div>
</template>
