<script lang="ts" setup>
import type {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  PaginationState,
  Row,
  SortingState,
  Updater,
  VisibilityState,
} from '@tanstack/vue-table';
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table';
import { refDebounced } from '@vueuse/core';
import { h, resolveComponent } from 'vue';
import { usePlayerStore } from '@/stores/players';
import { populateFilterPrices } from '@/utils/filters';
import { loadPlayerFallbackImage, getImageUrl } from '@/utils/images';
import { getPositionName } from '@/utils/playerPosition';
import type { PlayerWithSeasonStatistics } from '~/types/Player';
import { PlayerPosition } from '~/types/PlayerPosition';
import { isTeamRegistrationOpen } from '~~/shared/utils/appSettings';

const playerStore = usePlayerStore();

type PlayerTableRow = PlayerWithSeasonStatistics;
type AvailabilityFilter = 'all' | 'available' | 'unavailable' | 'season';
type SortOptionId = 'points' | 'goals' | 'assists' | 'clean_sheets' | 'red_cards' | 'cost' | 'player';
type PlayerFilterFn = (row: Row<PlayerTableRow>, columnId: string, filterValue: unknown) => boolean;
type TableColumnApi = {
  getIsSorted: () => false | 'asc' | 'desc';
  getSortIndex: () => number;
  toggleSorting: (desc?: boolean, isMulti?: boolean) => void;
  setFilterValue: (value?: unknown) => void;
};

const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({
  minutes: false,
});
const expanded = ref<ExpandedState>({});
const defaultSorting: SortingState = [
  { id: 'points', desc: true },
  { id: 'minutes', desc: true },
  { id: 'player_id', desc: false },
];
const sorting = ref<SortingState>([...defaultSorting]);
const pagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: 50,
});
const playerSearch = ref('');
const debouncedPlayerSearch = refDebounced(playerSearch, 250);
const mobileFiltersOpen = ref(false);
const statsDisplayTime = ref(new Date());
let statsDisplayInterval: ReturnType<typeof setInterval> | undefined;
const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const UPopover = resolveComponent('UPopover');
const USelectMenu = resolveComponent('USelectMenu');
const UTooltip = resolveComponent('UTooltip');

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

  return normalizeFilterValue([
    row.original.web_name,
    row.original.first_name,
    row.original.second_name,
  ].filter(Boolean).join(' ')).includes(search);
};

const positionFilter: PlayerFilterFn = (row, _columnId, filterValue) => {
  return filterValue === null || filterValue === undefined || row.original.position === filterValue;
};

const teamFilter: PlayerFilterFn = (row, _columnId, filterValue) => {
  if (Array.isArray(filterValue)) {
    return filterValue.length === 0 || filterValue.includes(row.original.team);
  }

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

const teamFilters = computed(() =>
  playerStore.getClubs.map(team => ({
    name: team.name ?? team.short_name ?? `Team ${team.id}`,
    value: team.id,
  })),
);

const priceFilters = populateFilterPrices();
const pageSizeOptions = [
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];
const mobileSortOptions = [
  { label: 'Points', value: 'points' },
  { label: 'Goals', value: 'goals' },
  { label: 'Assists', value: 'assists' },
  { label: 'Clean sheets', value: 'clean_sheets' },
  { label: 'Red cards', value: 'red_cards' },
  { label: 'Cost', value: 'cost' },
  { label: 'Player', value: 'player' },
] satisfies { label: string; value: SortOptionId }[];

const { teamRegistrationOpen, teamSubmissionDeadline } = useAppSettings();

const showPreviousSeasonStats = computed(() => isTeamRegistrationOpen({
  teamRegistrationOpen: teamRegistrationOpen.value,
  teamSubmissionDeadline: teamSubmissionDeadline.value,
}, statsDisplayTime.value));

const players = computed<PlayerTableRow[]>(() => playerStore.getPlayers.map((player) => {
  if (!showPreviousSeasonStats.value) {
    return player;
  }

  return {
    ...player,
    season_goals: player.previous_season_goals,
    season_assists: player.previous_season_assists,
    season_clean_sheets: player.previous_season_clean_sheets,
    season_red_cards: player.previous_season_red_cards,
    season_points: player.previous_season_points,
    minutes: player.previous_season_minutes,
  };
}));

const statsDisplayLabel = computed(() => showPreviousSeasonStats.value
  ? 'Showing previous-season FPL stats while team building is open'
  : 'Showing calculated current-season stats');

const activeFilterCount = computed(() => {
  return columnFilters.value.length;
});

const isDefaultSorting = computed(() =>
  sorting.value.length === defaultSorting.length
  && sorting.value.every((sort, index) => sort.id === defaultSorting[index]?.id && sort.desc === defaultSorting[index]?.desc),
);

const canResetTable = computed(() =>
  activeFilterCount.value > 0
  || !isDefaultSorting.value
  || pagination.value.pageIndex > 0
  || (expanded.value !== true && Object.keys(expanded.value).length > 0),
);

const getPlayerRowId = (player: PlayerTableRow) => String(player.player_id);

const getPlayerStats = (player: PlayerTableRow) => [
  { label: 'Goals', value: player.season_goals },
  { label: 'Assists', value: player.season_assists },
  { label: 'Clean sheets', value: player.season_clean_sheets },
  { label: 'Red cards', value: player.season_red_cards },
  { label: 'Points', value: player.season_points },
];

const togglePlayerRow = (row: Row<PlayerTableRow>) => {
  expanded.value = row.getIsExpanded() ? {} : { [row.id]: true };
};

const selectPlayerRow = (_event: Event, row: Row<PlayerTableRow>) => {
  togglePlayerRow(row);
};

const getAvailability = (player: PlayerTableRow) => {
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
  playerSearch.value = '';
  columnFilters.value = [];
  expanded.value = {};
  sorting.value = [...defaultSorting];
  pagination.value = { ...pagination.value, pageIndex: 0 };
};

const getColumnFilterValue = (id: string) => {
  return columnFilters.value.find(filter => filter.id === id)?.value;
};

const getColumnFilterNumber = (id: string) => Number(getColumnFilterValue(id) ?? 0);

const getColumnFilterNumbers = (id: string) => {
  const filterValue = getColumnFilterValue(id);

  return Array.isArray(filterValue) ? filterValue : [];
};

const getColumnFilterAvailability = () => (getColumnFilterValue('availability') ?? 'all') as AvailabilityFilter;

const isColumnFiltered = (id: string) => columnFilters.value.some(filter => filter.id === id);

const isEmptyFilterValue = (value: unknown, emptyValue: unknown) => {
  if (Array.isArray(value) && Array.isArray(emptyValue)) {
    return value.length === emptyValue.length;
  }

  return value === emptyValue;
};

const setColumnFilterValue = (id: string, value: unknown, emptyValue: unknown) => {
  const nextFilters = columnFilters.value.filter(filter => filter.id !== id);

  if (!isEmptyFilterValue(value, emptyValue)) {
    nextFilters.push({ id, value });
  }

  columnFilters.value = nextFilters;
  expanded.value = {};
  pagination.value = { ...pagination.value, pageIndex: 0 };
};

watch(debouncedPlayerSearch, value => setColumnFilterValue('player', value, ''));

const setColumnFilter = (column: TableColumnApi, value: unknown, emptyValue: unknown) => {
  column.setFilterValue(isEmptyFilterValue(value, emptyValue) ? undefined : value);
  expanded.value = {};
  pagination.value = { ...pagination.value, pageIndex: 0 };
};

const setPageSize = (pageSize: number) => {
  pagination.value = {
    pageIndex: 0,
    pageSize,
  };
};

const setCurrentPage = (page: number) => {
  pagination.value = {
    ...pagination.value,
    pageIndex: page - 1,
  };
  expanded.value = {};
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

const getSortPriority = (column: TableColumnApi) => {
  const sortIndex = column.getSortIndex();

  return sorting.value.length > 1 && sortIndex > -1 ? String(sortIndex + 1) : undefined;
};

const sortColumn = (column: TableColumnApi, event: MouseEvent) => {
  column.toggleSorting(column.getIsSorted() === 'asc', event.shiftKey);
};

const buildSorting = (primaryId: SortOptionId, desc: boolean): SortingState => [
  { id: primaryId, desc },
  ...defaultSorting.filter(sort => sort.id !== primaryId),
];

const mobileSortId = computed<SortOptionId>({
  get: () => {
    const primarySort = sorting.value.find(sort => mobileSortOptions.some(option => option.value === sort.id));

    return (primarySort?.id as SortOptionId | undefined) ?? 'points';
  },
  set: (value) => {
    sorting.value = buildSorting(value, mobileSortDirection.value === 'desc');
    expanded.value = {};
    pagination.value = { ...pagination.value, pageIndex: 0 };
  },
});

const mobileSortDirection = computed<'asc' | 'desc'>({
  get: () => (sorting.value[0]?.desc === false ? 'asc' : 'desc'),
  set: (value) => {
    sorting.value = buildSorting(mobileSortId.value, value === 'desc');
    expanded.value = {};
    pagination.value = { ...pagination.value, pageIndex: 0 };
  },
});

const renderSortButton = (
  column: TableColumnApi,
  label: string,
  className = 'justify-start px-0 font-semibold dark:!text-slate-100',
) => h('div', { class: 'flex items-center gap-1' }, [
  h(UButton, {
    label,
    icon: getSortIcon(column),
    color: 'neutral',
    variant: 'ghost',
    size: 'xs',
    class: className,
    onClick: (event: MouseEvent) => sortColumn(column, event),
  }),
  getSortPriority(column)
    ? h(UBadge, {
        label: getSortPriority(column),
        color: 'neutral',
        variant: 'soft',
        size: 'sm',
        class: 'normal-case',
      })
    : null,
]);

const renderFilterButton = (id: string, label: string) =>
  h(UButton, {
    'icon': 'lucide:funnel',
    'color': isColumnFiltered(id) ? 'primary' : 'neutral',
    'variant': isColumnFiltered(id) ? 'soft' : 'ghost',
    'size': 'xs',
    'square': true,
    'aria-label': label,
  });

const renderClearFilterButton = (column: TableColumnApi, id: string) =>
  h(UButton, {
    label: 'Clear',
    icon: 'lucide:x',
    color: 'neutral',
    variant: 'ghost',
    size: 'xs',
    disabled: !isColumnFiltered(id),
    onClick: () => column.setFilterValue(undefined),
  });

const renderSelectFilterHeader = ({
  column,
  id,
  label,
  widthClass,
  items,
  modelValue,
  labelKey,
  valueKey,
  emptyValue,
  multiple = false,
  align = 'start',
  popoverWidthClass,
  sortButtonClass = 'justify-start px-0 font-semibold dark:!text-slate-100',
}: {
  column: TableColumnApi;
  id: string;
  label: string;
  widthClass: string;
  items: unknown[];
  modelValue: unknown;
  labelKey: string;
  valueKey: string;
  emptyValue: unknown;
  multiple?: boolean;
  align?: 'start' | 'end';
  popoverWidthClass: string;
  sortButtonClass?: string;
}) =>
  h('div', { class: `flex items-center gap-1.5 ${widthClass}` }, [
    renderSortButton(column, label, sortButtonClass),
    h(UPopover, { content: { align } }, {
      default: () => renderFilterButton(id, `Filter ${label.toLowerCase()}`),
      content: () => h('div', { class: `${popoverWidthClass} space-y-3 p-3` }, [
        h(USelectMenu, {
          'modelValue': modelValue,
          'class': 'w-full normal-case',
          'labelKey': labelKey,
          'valueKey': valueKey,
          'items': items,
          'multiple': multiple,
          'size': 'sm',
          'onUpdate:modelValue': (value: unknown) => setColumnFilter(column, value, emptyValue),
        }),
        renderClearFilterButton(column, id),
      ]),
    }),
  ]);

const renderStatHeader = (column: TableColumnApi, label: string, tooltip: string) =>
  h(UTooltip, { text: tooltip }, {
    default: () => renderSortButton(column, label, 'ml-auto px-0 font-semibold dark:!text-slate-100'),
  });

const renderNumericCell = (value: unknown, className = 'font-medium text-slate-700 dark:text-slate-200') =>
  h('div', { class: `text-right ${className}` }, String(value ?? 0));

const renderExpandedButton = (row: Row<PlayerTableRow>) =>
  h(UButton, {
    'icon': row.getIsExpanded() ? 'lucide:chevron-down' : 'lucide:chevron-right',
    'color': 'neutral',
    'variant': 'ghost',
    'size': 'xs',
    'square': true,
    'aria-label': row.getIsExpanded() ? 'Collapse player details' : 'Expand player details',
    'class': 'dark:!text-slate-100',
    'onClick': (event: MouseEvent) => {
      event.stopPropagation();
      togglePlayerRow(row);
    },
  });

const renderPlayerCell = (player: PlayerTableRow) =>
  h('div', { class: 'flex items-center gap-3' }, [
    h('img', {
      class: 'h-9 w-9 rounded-full bg-white object-cover object-top shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700',
      src: player.image,
      alt: player.web_name,
      onError: loadPlayerFallbackImage,
    }),
    h('div', { class: 'min-w-0' }, [
      h('div', { class: 'truncate font-semibold text-slate-900 dark:text-slate-100' }, player.web_name),
      player.news
        ? h('div', { class: 'max-w-72 truncate text-xs text-slate-500 dark:text-slate-400' }, player.news)
        : null,
    ]),
  ]);

const renderTeamCell = (player: PlayerTableRow) =>
  h('div', { class: 'flex items-center gap-2' }, [
    h('img', {
      class: 'aspect-square h-6 w-6 object-contain',
      src: getImageUrl(player.team_short_name.toLowerCase()),
      alt: player.team_short_name,
    }),
    h('span', { class: 'font-medium text-slate-700 dark:text-slate-200' }, player.team_short_name),
  ]);

const renderAvailabilityCell = (player: PlayerTableRow) =>
  h(UTooltip, { text: player.news || getAvailability(player).label }, {
    default: () => h(UBadge, {
      color: getAvailability(player).color,
      variant: 'soft',
      icon: getAvailability(player).icon,
      label: getAvailability(player).label,
    }),
  });

type ColumnClassMeta = { class?: { th?: string; td?: string } };

const getHeaderClass = (header: { column: { columnDef: { meta?: unknown } } }) =>
  (header.column.columnDef.meta as ColumnClassMeta | undefined)?.class?.th;

const getCellClass = (cell: { column: { columnDef: { meta?: unknown } } }) =>
  (cell.column.columnDef.meta as ColumnClassMeta | undefined)?.class?.td;

const columns: ColumnDef<PlayerTableRow>[] = [
  {
    id: 'expand',
    header: '',
    enableSorting: false,
    cell: ({ row }) => renderExpandedButton(row),
    meta: { class: { th: 'w-10 align-top', td: 'w-10' } },
  },
  {
    accessorKey: 'player_id',
    header: ({ column }) => renderSortButton(column as TableColumnApi, 'ID', 'px-0 font-semibold dark:!text-slate-100'),
    cell: ({ getValue }) => String(getValue()),
    meta: { class: { th: 'w-20 align-top' } },
  },
  {
    accessorKey: 'web_name',
    id: 'player',
    header: ({ column }) => renderSortButton(column as TableColumnApi, 'Player'),
    cell: ({ row }) => renderPlayerCell(row.original),
    filterFn: playerNameFilter,
    meta: { class: { th: 'min-w-64 align-top' } },
  },
  {
    accessorKey: 'season_points',
    id: 'points',
    header: ({ column }) => renderStatHeader(column as TableColumnApi, 'Pts', 'Points'),
    cell: ({ getValue }) => renderNumericCell(getValue()),
    meta: { class: { th: 'w-20 align-top text-right' } },
  },
  {
    accessorKey: 'season_goals',
    id: 'goals',
    header: ({ column }) => renderStatHeader(column as TableColumnApi, 'G', 'Goals scored'),
    cell: ({ getValue }) => renderNumericCell(getValue()),
    meta: { class: { th: 'w-20 align-top text-right' } },
  },
  {
    accessorKey: 'season_assists',
    id: 'assists',
    header: ({ column }) => renderStatHeader(column as TableColumnApi, 'A', 'Assists'),
    cell: ({ getValue }) => renderNumericCell(getValue()),
    meta: { class: { th: 'w-20 align-top text-right' } },
  },
  {
    accessorKey: 'season_clean_sheets',
    id: 'clean_sheets',
    header: ({ column }) => renderStatHeader(column as TableColumnApi, 'CS', 'Clean sheets'),
    cell: ({ getValue }) => renderNumericCell(getValue()),
    meta: { class: { th: 'w-20 align-top text-right' } },
  },
  {
    accessorKey: 'season_red_cards',
    id: 'red_cards',
    header: ({ column }) => renderStatHeader(column as TableColumnApi, 'RC', 'Red cards'),
    cell: ({ getValue }) => renderNumericCell(getValue()),
    meta: { class: { th: 'w-20 align-top text-right' } },
  },
  { accessorKey: 'minutes', id: 'minutes' },
  {
    accessorKey: 'position',
    id: 'position',
    header: ({ column }) => renderSelectFilterHeader({
      column: column as TableColumnApi,
      id: 'position',
      label: 'Pos.',
      widthClass: 'w-28',
      items: positionFilters,
      modelValue: getColumnFilterNumber('position') || null,
      labelKey: 'label',
      valueKey: 'value',
      emptyValue: null,
      popoverWidthClass: 'w-48',
    }),
    filterFn: positionFilter,
    cell: ({ row }) =>
      h(UBadge, {
        color: 'neutral',
        variant: 'soft',
        label: getPositionName(row.original.position),
      }),
    meta: { class: { th: 'w-32 align-top' } },
  },
  {
    accessorKey: 'team_short_name',
    id: 'team',
    header: ({ column }) => renderSelectFilterHeader({
      column: column as TableColumnApi,
      id: 'team',
      label: 'Team',
      widthClass: 'w-32',
      items: teamFilters.value,
      modelValue: getColumnFilterNumbers('team'),
      labelKey: 'name',
      valueKey: 'value',
      emptyValue: [],
      multiple: true,
      popoverWidthClass: 'w-64',
    }),
    filterFn: teamFilter,
    cell: ({ row }) => renderTeamCell(row.original),
    meta: { class: { th: 'w-32' } },
  },
  {
    accessorKey: 'cost',
    id: 'cost',
    header: ({ column }) => renderSelectFilterHeader({
      column: column as TableColumnApi,
      id: 'cost',
      label: 'Cost',
      widthClass: 'ml-auto w-28 justify-end',
      items: priceFilters,
      modelValue: getColumnFilterNumber('cost'),
      labelKey: 'name',
      valueKey: 'value',
      emptyValue: 0,
      align: 'end',
      popoverWidthClass: 'w-44',
      sortButtonClass: 'justify-end px-0 font-semibold dark:!text-slate-100',
    }),
    filterFn: priceFilter,
    cell: ({ row }) => renderNumericCell(row.original.cost.toFixed(1), 'font-semibold text-slate-900 dark:text-slate-100'),
    meta: { class: { th: 'w-28 align-top text-right' } },
  },
  {
    accessorKey: 'is_unavailable',
    id: 'availability',
    header: ({ column }) =>
      h('div', { class: 'flex w-40 items-center gap-1.5' }, [
        h('span', { class: 'font-semibold' }, 'Availability'),
        h(UPopover, { content: { align: 'start' } }, {
          default: () => renderFilterButton('availability', 'Filter availability'),
          content: () => h('div', { class: 'w-52 space-y-3 p-3' }, [
            h(USelectMenu, {
              'modelValue': getColumnFilterAvailability(),
              'class': 'w-full normal-case',
              'labelKey': 'label',
              'valueKey': 'value',
              'items': availabilityFilters,
              'size': 'sm',
              'onUpdate:modelValue': (value: unknown) => setColumnFilter(column as TableColumnApi, value, 'all'),
            }),
            renderClearFilterButton(column as TableColumnApi, 'availability'),
          ]),
        }),
      ]),
    filterFn: availabilityFilter,
    enableSorting: false,
    cell: ({ row }) => renderAvailabilityCell(row.original),
    meta: { class: { th: 'w-44 align-top' } },
  },
];

function valueUpdater<T>(updaterOrValue: Updater<T>, target: { value: T }) {
  target.value = typeof updaterOrValue === 'function'
    ? (updaterOrValue as (old: T) => T)(target.value)
    : updaterOrValue;
}

const table = useVueTable({
  get data() {
    return players.value;
  },
  columns,
  getRowId: getPlayerRowId,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
  onPaginationChange: updaterOrValue => valueUpdater(updaterOrValue, pagination),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  state: {
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get expanded() {
      return expanded.value;
    },
    get pagination() {
      return pagination.value;
    },
    get sorting() {
      return sorting.value;
    },
  },
});

const filteredRowCount = computed(() => table.getFilteredRowModel().rows.length);
const currentRows = computed(() => table.getRowModel().rows);

const visibleRange = computed(() => {
  if (filteredRowCount.value === 0) {
    return '0 players';
  }

  const start = pagination.value.pageIndex * pagination.value.pageSize + 1;
  const end = Math.min(start + pagination.value.pageSize - 1, filteredRowCount.value);

  return `${start}-${end} of ${filteredRowCount.value} players`;
});

onMounted(() => {
  statsDisplayInterval = setInterval(() => {
    statsDisplayTime.value = new Date();
  }, 60_000);
});

onBeforeUnmount(() => {
  if (statsDisplayInterval) {
    clearInterval(statsDisplayInterval);
  }
});
</script>

<template>
  <SkeletonPlayers v-if="!playerStore.isLoaded" />
  <div
    v-else
    class="w-full"
  >
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
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ statsDisplayLabel }}
            </p>
          </div>
          <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <UInput
              v-model="playerSearch"
              icon="tabler:search"
              placeholder="Search players"
              size="sm"
              class="w-full sm:w-64"
            />
            <UButton
              icon="lucide:rotate-ccw"
              label="Reset"
              color="neutral"
              variant="ghost"
              size="sm"
              :disabled="!canResetTable"
              class="dark:!text-slate-100 dark:hover:!bg-slate-800"
              @click="resetFilters"
            />
          </div>
        </div>
      </div>

      <div class="grid gap-3 border-b border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:hidden">
        <div class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
          <USelect
            v-model="mobileSortId"
            :items="mobileSortOptions"
            value-key="value"
            label-key="label"
            size="sm"
            class="min-w-0"
          />
          <UButton
            :icon="mobileSortDirection === 'desc' ? 'lucide:arrow-down' : 'lucide:arrow-up'"
            :label="mobileSortDirection === 'desc' ? 'Desc' : 'Asc'"
            color="neutral"
            variant="soft"
            size="sm"
            class="shrink-0"
            @click="mobileSortDirection = mobileSortDirection === 'desc' ? 'asc' : 'desc'"
          />
          <UButton
            icon="lucide:funnel"
            :label="activeFilterCount ? `${activeFilterCount}` : 'Filters'"
            :color="activeFilterCount ? 'primary' : 'neutral'"
            :variant="activeFilterCount ? 'soft' : 'outline'"
            size="sm"
            class="shrink-0"
            @click="mobileFiltersOpen = true"
          />
        </div>

        <Teleport to="body">
          <UDrawer
            v-model:open="mobileFiltersOpen"
            :portal="false"
            direction="bottom"
            title="Filters"
            description="Refine the player list"
            :ui="{
              content: 'w-full max-w-full',
              container: 'w-full min-w-0 max-w-full overflow-y-auto px-4',
              body: 'w-full min-w-0',
            }"
          >
            <template #body>
              <div class="w-full min-w-0 space-y-4 pr-1">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Position
                  </label>
                  <USelectMenu
                    :model-value="getColumnFilterNumber('position') || null"
                    :items="positionFilters"
                    label-key="label"
                    value-key="value"
                    size="sm"
                    class="w-full min-w-0"
                    @update:model-value="setColumnFilterValue('position', $event, null)"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Teams
                  </label>
                  <USelectMenu
                    :model-value="getColumnFilterNumbers('team')"
                    :items="teamFilters"
                    label-key="name"
                    value-key="value"
                    multiple
                    size="sm"
                    class="w-full min-w-0"
                    @update:model-value="setColumnFilterValue('team', $event, [])"
                  />
                </div>

                <div class="grid min-w-0 grid-cols-2 gap-3">
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Cost
                    </label>
                    <USelectMenu
                      :model-value="getColumnFilterNumber('cost')"
                      :items="priceFilters"
                      label-key="name"
                      value-key="value"
                      size="sm"
                      class="w-full min-w-0"
                      @update:model-value="setColumnFilterValue('cost', $event, 0)"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Availability
                    </label>
                    <USelectMenu
                      :model-value="getColumnFilterAvailability()"
                      :items="availabilityFilters"
                      label-key="label"
                      value-key="value"
                      size="sm"
                      class="w-full min-w-0"
                      @update:model-value="setColumnFilterValue('availability', $event, 'all')"
                    />
                  </div>
                </div>
              </div>
            </template>

            <template #footer>
              <div class="flex w-full items-center justify-between gap-3">
                <UButton
                  icon="lucide:rotate-ccw"
                  label="Reset"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :disabled="!canResetTable"
                  @click="resetFilters"
                />
                <UButton
                  label="Done"
                  color="primary"
                  size="sm"
                  @click="mobileFiltersOpen = false"
                />
              </div>
            </template>
          </UDrawer>
        </Teleport>
      </div>

      <div class="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900 md:hidden">
        <div
          v-if="currentRows.length === 0"
          class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
        >
          No players found
        </div>

        <article
          v-for="row in currentRows"
          :key="row.id"
          class="bg-white dark:bg-slate-900"
        >
          <button
            type="button"
            class="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
            :aria-expanded="row.getIsExpanded()"
            @click="togglePlayerRow(row)"
          >
            <img
              class="h-11 w-11 rounded-full bg-white object-cover object-top shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
              :src="row.original.image"
              :alt="row.original.web_name"
              @error="loadPlayerFallbackImage"
            >

            <div class="min-w-0">
              <div class="flex min-w-0 items-center gap-2">
                <span class="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
                  {{ row.original.web_name }}
                </span>
                <UBadge
                  color="neutral"
                  variant="soft"
                  size="sm"
                  :label="getPositionName(row.original.position)"
                />
              </div>
              <div class="mt-1 flex min-w-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <img
                  class="aspect-square h-4 w-4 object-contain"
                  :src="getImageUrl(row.original.team_short_name.toLowerCase())"
                  :alt="row.original.team_short_name"
                >
                <span class="truncate">{{ row.original.team_short_name }}</span>
                <span>{{ row.original.cost.toFixed(1) }}m</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="text-right">
                <div class="font-mono text-lg font-semibold leading-5 text-slate-950 dark:text-slate-50">
                  {{ row.original.season_points }}
                </div>
                <div class="text-[0.65rem] font-semibold uppercase leading-4 text-slate-500 dark:text-slate-400">
                  Points
                </div>
              </div>
              <UIcon
                :name="row.getIsExpanded() ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                class="h-4 w-4 text-slate-400"
              />
            </div>
          </button>

          <div
            v-if="row.getIsExpanded()"
            class="space-y-3 px-3 pb-4"
          >
            <dl class="grid grid-cols-5 divide-x divide-slate-200 rounded-md bg-slate-50 py-2 text-center dark:divide-slate-700 dark:bg-slate-800/70">
              <div
                v-for="stat in getPlayerStats(row.original)"
                :key="stat.label"
                class="px-1.5"
              >
                <dt class="text-[0.6rem] font-semibold uppercase leading-4 text-slate-500 dark:text-slate-400">
                  {{ stat.label }}
                </dt>
                <dd class="font-mono text-sm font-semibold text-slate-950 dark:text-slate-50">
                  {{ stat.value }}
                </dd>
              </div>
            </dl>

            <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <UBadge
                :color="getAvailability(row.original).color"
                variant="soft"
                :icon="getAvailability(row.original).icon"
                :label="getAvailability(row.original).label"
              />
              <span class="font-mono font-semibold text-slate-800 dark:text-slate-100">
                {{ row.original.cost.toFixed(1) }}m
              </span>
              <span class="text-slate-500 dark:text-slate-400">
                {{ row.original.minutes ?? 0 }} mins
              </span>
              <span class="text-slate-500 dark:text-slate-400">
                #{{ row.original.player_id }}
              </span>
            </div>

            <p
              v-if="row.original.news"
              class="text-sm text-slate-600 dark:text-slate-300"
            >
              {{ row.original.news }}
            </p>
          </div>
        </article>
      </div>

      <div class="hidden w-full md:block">
        <div class="w-full overflow-x-auto">
          <table class="w-full min-w-[1180px] text-sm">
            <thead>
              <tr
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id"
              >
                <th
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  :colspan="header.colSpan"
                  class="bg-slate-50 px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  :class="getHeaderClass(header)"
                >
                  <FlexRender
                    v-if="!header.isPlaceholder"
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-if="currentRows.length">
                <template
                  v-for="row in currentRows"
                  :key="row.id"
                >
                  <tr
                    class="cursor-pointer even:bg-slate-50/70 hover:bg-slate-100 dark:even:bg-slate-800/50 dark:hover:bg-slate-800"
                    :data-expanded="row.getIsExpanded()"
                    @click="selectPlayerRow($event, row)"
                  >
                    <td
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                      class="px-4 py-3 align-middle"
                      :class="getCellClass(cell)"
                    >
                      <FlexRender
                        :render="cell.column.columnDef.cell"
                        :props="cell.getContext()"
                      />
                    </td>
                  </tr>

                  <tr
                    v-if="row.getIsExpanded()"
                    class="even:bg-slate-50/70 dark:even:bg-slate-800/50"
                  >
                    <td
                      :colspan="row.getVisibleCells().length"
                      class="p-0 align-middle"
                    >
                      <div class="border-y border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                        <div class="grid items-center gap-5 xl:grid-cols-[minmax(22rem,28rem)_minmax(24rem,1fr)_minmax(16rem,22rem)]">
                          <div class="flex min-w-0 items-center gap-4">
                            <img
                              class="h-16 w-16 shrink-0 rounded-full bg-white object-cover object-top shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                              :src="row.original.image_large"
                              :alt="row.original.web_name"
                              @error="loadPlayerFallbackImage"
                            >
                            <div class="min-w-0">
                              <div class="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                #{{ row.original.player_id }}
                              </div>
                              <div class="truncate text-xl font-semibold text-slate-950 dark:text-slate-50">
                                {{ row.original.first_name }} {{ row.original.second_name }}
                              </div>
                              <div class="mt-2 flex flex-wrap items-center gap-2">
                                <UBadge
                                  color="neutral"
                                  variant="soft"
                                  :label="getPositionName(row.original.position)"
                                />
                                <span class="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                                  <img
                                    class="aspect-square h-5 w-5 object-contain"
                                    :src="getImageUrl(row.original.team_short_name.toLowerCase())"
                                    :alt="row.original.team_short_name"
                                  >
                                  {{ row.original.team_name }}
                                </span>
                              </div>
                            </div>
                          </div>

                          <dl class="grid grid-cols-5 divide-x divide-slate-200 text-sm dark:divide-slate-700">
                            <div
                              v-for="stat in getPlayerStats(row.original)"
                              :key="stat.label"
                              class="px-2 text-center"
                            >
                              <dt class="text-[0.625rem] font-semibold uppercase leading-4 text-slate-500 dark:text-slate-400">
                                {{ stat.label }}
                              </dt>
                              <dd class="font-mono text-base font-semibold leading-5 text-slate-950 dark:text-slate-50">
                                {{ stat.value }}
                              </dd>
                            </div>
                          </dl>

                          <div class="min-w-0 space-y-2 text-sm">
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                              <UBadge
                                :color="getAvailability(row.original).color"
                                variant="soft"
                                :icon="getAvailability(row.original).icon"
                                :label="getAvailability(row.original).label"
                              />
                              <span class="font-mono font-semibold text-slate-800 dark:text-slate-100">
                                {{ row.original.cost.toFixed(1) }}m
                              </span>
                              <span class="text-slate-500 dark:text-slate-400">
                                {{ row.original.minutes ?? 0 }} mins
                              </span>
                            </div>
                            <p
                              v-if="row.original.news"
                              class="line-clamp-2 text-slate-600 dark:text-slate-300"
                            >
                              {{ row.original.news }}
                            </p>
                            <p
                              v-else
                              class="text-slate-500 dark:text-slate-400"
                            >
                              No current player news.
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
              <tr v-else>
                <td
                  :colspan="table.getVisibleLeafColumns().length"
                  class="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                >
                  No players found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300">
          <span>{{ visibleRange }}</span>
          <span>{{ activeFilterCount }} active filters</span>
        </div>
        <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <USelect
            :model-value="pagination.pageSize"
            :items="pageSizeOptions"
            value-key="value"
            label-key="label"
            size="sm"
            class="w-24"
            @update:model-value="setPageSize(Number($event))"
          />
          <UPagination
            :page="pagination.pageIndex + 1"
            :items-per-page="pagination.pageSize"
            :total="filteredRowCount"
            size="sm"
            :show-edges="false"
            :sibling-count="0"
            @update:page="setCurrentPage($event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
