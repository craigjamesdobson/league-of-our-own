<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui';
import { useTableStore } from '@/stores/table';
import type { WeeklyWinners } from '~/types/Table';

const tableStore = useTableStore();

onMounted(() => {
  tableStore.fetchWeeklyWinners();
});

const columns: TableColumn<WeeklyWinners>[] = [
  {
    accessorKey: 'week',
    header: 'Week',
    meta: {
      class: {
        th: 'w-1/12',
        td: 'font-bold',
      },
    },
  },
  {
    accessorKey: 'top_teams',
    header: 'Team',
    meta: {
      class: {
        th: 'w-10/12',
      },
    },
  },
  {
    accessorKey: 'points',
    header: 'Points',
    meta: {
      class: {
        th: 'w-1/12 text-right',
        td: 'text-right font-bold',
      },
    },
  },
];
</script>

<template>
  <h2 class="mb-5 lg:mb-12 text-xl font-black uppercase">
    Weekly Winners
  </h2>
  <UTable
    :data="tableStore.weeklyWinners || []"
    :columns="columns"
    :ui="{
      root: 'overflow-hidden rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
      base: 'w-full text-left text-sm',
      th: 'bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300',
      tr: 'odd:bg-white even:bg-slate-50/70 dark:odd:bg-slate-900 dark:even:bg-slate-800/40',
    }"
  >
    <template #top_teams-cell="{ row }">
      <template v-if="!!row.original.points">
        <div class="flex flex-col gap-2.5">
          <div
            v-for="(winner, index) in row.original.top_teams"
            :key="index"
            class="flex flex-col gap-1 text-sm font-black uppercase"
          >
            <div>{{ winner.team_name }}</div>
            <div class="text-xs font-normal text-slate-500 dark:text-slate-400">
              {{ winner.team_owner }}
            </div>
          </div>
        </div>
      </template>
      <UBadge
        v-else
        color="neutral"
        variant="soft"
        label="Pending..."
      />
    </template>
  </UTable>
</template>
