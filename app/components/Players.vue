<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui';
import { usePlayerStore } from '@/stores/players';
import { TEAM_DATA } from '@/logic/teams/constants';
import { populateFilterPrices } from '@/utils/filters';
import { loadPlayerFallbackImage, getImageUrl } from '@/utils/images';
import type { Player } from '~/types/Player';
import { PlayerPosition } from '~/types/PlayerPosition';

const router = useRouter();
const route = useRoute();
const playerStore = usePlayerStore();
const selectedPlayer: Ref<Player | null> = ref(null);
const showDialog = ref(false);

type AvailabilityFilter = 'all' | 'available' | 'unavailable' | 'season';
type ColumnFiltersState = { id: string; value: unknown }[];
type PlayerFilterRow = { original: Player };
type PlayerFilterFn = (row: PlayerFilterRow, columnId: string, filterValue: unknown) => boolean;
type PlayerTable = {
  tableApi: {
    getFilteredRowModel: () => {
      rows: unknown[];
    };
  };
};

const table = useTemplateRef<PlayerTable>('table');
const globalFilter = ref('');
const columnFilters = ref<ColumnFiltersState>([]);
const selectedTeam = ref(0);
const selectedPrice = ref(0);
const selectedPosition = ref<PlayerPosition | null>(null);
const selectedAvailability = ref<AvailabilityFilter>('all');

const normalizeFilterValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase();

const playerGlobalFilter: PlayerFilterFn = (row, _columnId, filterValue) => {
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
  { accessorKey: 'player_id', header: 'ID', meta: { class: { th: 'w-20' } } },
  { accessorKey: 'web_name', id: 'player', header: 'Player', meta: { class: { th: 'min-w-56' } } },
  { accessorKey: 'position', id: 'position', header: 'Pos.', filterFn: positionFilter, meta: { class: { th: 'w-32' } } },
  { accessorKey: 'team_short_name', id: 'team', header: 'Team', filterFn: teamFilter, meta: { class: { th: 'w-32' } } },
  { accessorKey: 'cost', id: 'cost', header: 'Cost', filterFn: priceFilter, meta: { class: { th: 'w-24 text-right' } } },
  { accessorKey: 'is_unavailable', id: 'availability', header: 'Availability', filterFn: availabilityFilter, meta: { class: { th: 'w-44' } } },
  { accessorKey: 'minutes', header: 'Minutes', meta: { class: { th: 'w-28 text-right' } } },
];

const positionFilters = [
  { label: 'All', value: null, icon: 'lucide:list-filter' },
  { label: 'GKP', value: PlayerPosition.GOALKEEPER, icon: 'tabler:hand-stop' },
  { label: 'DEF', value: PlayerPosition.DEFENDER, icon: 'tabler:shield' },
  { label: 'MID', value: PlayerPosition.MIDFIELDER, icon: 'ph:brain-duotone' },
  { label: 'FWD', value: PlayerPosition.FORWARD, icon: 'mage:goals' },
] satisfies { label: string; value: PlayerPosition | null; icon: string }[];

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
    .sort((a, b) => a.position - b.position || a.team - b.team || a.web_name.localeCompare(b.web_name)),
);

const filterSnapshot = computed(() => ({
  globalFilter: globalFilter.value,
  columnFilters: columnFilters.value,
  playerCount: sortedPlayers.value.length,
}));

const filteredRowCount = ref(0);

const updateFilteredRowCount = async () => {
  await nextTick();
  filteredRowCount.value = table.value?.tableApi.getFilteredRowModel().rows.length ?? sortedPlayers.value.length;
};

const activeFilterCount = computed(() => {
  return [
    globalFilter.value.trim(),
    selectedTeam.value,
    selectedPrice.value,
    selectedPosition.value,
    selectedAvailability.value !== 'all',
  ].filter(Boolean).length;
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

const getPositionLabel = (position: number) => {
  switch (position) {
    case PlayerPosition.GOALKEEPER:
      return 'GKP';
    case PlayerPosition.DEFENDER:
      return 'DEF';
    case PlayerPosition.MIDFIELDER:
      return 'MID';
    case PlayerPosition.FORWARD:
      return 'FWD';
    default:
      return 'N/A';
  }
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

const getToggleButtonClass = (isSelected: boolean) => {
  return isSelected
    ? 'dark:!text-slate-50'
    : 'dark:!text-slate-100 dark:hover:!bg-slate-800';
};

const setColumnFilter = (id: string, value: unknown, isActive: boolean) => {
  columnFilters.value = [
    ...columnFilters.value.filter(filter => filter.id !== id),
    ...(isActive ? [{ id, value }] : []),
  ];
};

const resetFilters = () => {
  globalFilter.value = '';
  selectedTeam.value = 0;
  selectedPrice.value = 0;
  selectedPosition.value = null;
  selectedAvailability.value = 'all';
};

onMounted(async () => {
  if (route.query.id) {
    selectedPlayer.value = playerStore.getPlayerByID(+route.query.id) as Player;
    showDialog.value = true;
  }
});

watch(selectedPosition, (position) => {
  setColumnFilter('position', position, position !== null);
});

watch(selectedTeam, (team) => {
  setColumnFilter('team', team, team !== 0);
});

watch(selectedPrice, (price) => {
  setColumnFilter('cost', price, price !== 0);
});

watch(selectedAvailability, (availability) => {
  setColumnFilter('availability', availability, availability !== 'all');
});

watch(filterSnapshot, updateFilteredRowCount, { deep: true, immediate: true, flush: 'post' });
</script>

<template>
  <SkeletonPlayers v-if="!playerStore.isLoaded" />
  <div v-else>
    <PlayerModal
      v-model="showDialog"
      :selected-player="selectedPlayer"
    />
    <div class="rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
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
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <UInput
            v-model="globalFilter"
            class="w-full"
            icon="tabler:search"
            placeholder="Search players..."
          />
          <USelectMenu
            v-model="selectedTeam"
            class="w-full"
            label-key="name"
            value-key="value"
            :items="teamFilters"
            placeholder="All teams"
          />
          <USelectMenu
            v-model="selectedPrice"
            class="w-full"
            label-key="name"
            value-key="value"
            :items="priceFilters"
            placeholder="All prices"
          />
        </div>
        <div class="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-slate-600 dark:text-slate-300">Position:</span>
            <UButton
              v-for="position in positionFilters"
              :key="position.label"
              :label="position.label"
              :icon="position.icon"
              :variant="selectedPosition === position.value ? 'solid' : 'soft'"
              color="neutral"
              size="sm"
              :class="getToggleButtonClass(selectedPosition === position.value)"
              @click="selectedPosition = position.value"
            />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-slate-600 dark:text-slate-300">Availability:</span>
            <UButton
              v-for="availability in availabilityFilters"
              :key="availability.value"
              :label="availability.label"
              :variant="selectedAvailability === availability.value ? 'solid' : 'soft'"
              color="neutral"
              size="sm"
              :class="getToggleButtonClass(selectedAvailability === availability.value)"
              @click="selectedAvailability = availability.value"
            />
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <UTable
          ref="table"
          v-model:global-filter="globalFilter"
          v-model:column-filters="columnFilters"
          :data="sortedPlayers"
          :columns="columns"
          empty="No players found"
          :global-filter-options="{ globalFilterFn: playerGlobalFilter }"
          :ui="{
            root: 'min-w-full',
            base: 'min-w-[760px] text-sm',
            th: 'bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200',
            td: 'align-middle',
            tr: 'cursor-pointer even:bg-slate-50/70 hover:bg-slate-100 dark:even:bg-slate-800/50 dark:hover:bg-slate-800',
            empty: 'py-10 text-center text-slate-500 dark:text-slate-400',
          }"
          :on-select="selectPlayerRow"
        >
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

          <template #position-cell="{ row }">
            <UBadge
              color="neutral"
              variant="soft"
              :label="getPositionLabel(row.original.position)"
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

          <template #minutes-cell="{ row }">
            <div class="text-right text-slate-700 dark:text-slate-200">
              {{ row.original.minutes?.toLocaleString('en-GB') ?? 'N/A' }}
            </div>
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
