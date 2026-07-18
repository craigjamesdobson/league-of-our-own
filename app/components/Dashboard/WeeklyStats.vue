<script setup lang="ts">
import WeeklySummaryCard from '@/components/Dashboard/WeeklySummaryCard.vue';
import type { LeagueAverages } from '@/types/Dashboard';

defineProps({
  leagueAverages: {
    type: Object as PropType<LeagueAverages>,
    default: () => ({
      averagePoints: 0,
      totalTeams: 0,
      highestPoints: 0,
      lowestPoints: 0,
      weeksPlayed: 0,
    }),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <WeeklySummaryCard
    :is-loading="isLoading"
  >
    <template #skeleton>
      <!-- Weekly Stats Skeleton - matches 2x2/4-column grid with icon/number/label structure -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
        <div
          v-for="n in 4"
          :key="n"
          class="flex flex-col justify-center items-center p-5 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-lg shadow-sm dark:from-slate-800 dark:to-slate-900 dark:border-slate-700"
        >
          <div class="mb-2">
            <USkeleton class="h-8 w-8 rounded-full" />
          </div>
          <div class="mb-1">
            <USkeleton class="h-9 w-12" />
          </div>
          <div>
            <USkeleton class="h-3 w-20" />
          </div>
        </div>
      </div>
    </template>
    <div
      v-if="leagueAverages.totalTeams > 0"
      class="h-full"
    >
      <!-- League Stats Row - 2x2 on mobile, 4 cols on desktop -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="flex flex-col justify-center items-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm dark:from-blue-950/70 dark:to-slate-900 dark:border-blue-800">
          <div class="mb-2">
            <Icon
              name="i-lucide-bar-chart-3"
              class="text-blue-600 text-2xl dark:text-blue-300"
            />
          </div>
          <div class="text-3xl font-bold text-blue-700 mb-1 dark:text-blue-200">
            {{ Math.round(leagueAverages.averagePoints) }}
          </div>
          <div class="text-xs text-slate-600 uppercase font-bold tracking-wider dark:text-slate-300">
            Average Points
          </div>
        </div>

        <div class="flex flex-col justify-center items-center p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm dark:from-green-950/70 dark:to-slate-900 dark:border-green-800">
          <div class="mb-2">
            <Icon
              name="i-lucide-arrow-up"
              class="text-green-600 text-2xl dark:text-green-300"
            />
          </div>
          <div class="text-3xl font-bold text-green-700 mb-1 dark:text-green-200">
            {{ leagueAverages.highestPoints }}
          </div>
          <div class="text-xs text-slate-600 uppercase font-bold tracking-wider dark:text-slate-300">
            Highest Score
          </div>
        </div>

        <div class="flex flex-col justify-center items-center p-5 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg shadow-sm dark:from-orange-950/70 dark:to-slate-900 dark:border-orange-800">
          <div class="mb-2">
            <Icon
              name="i-lucide-arrow-down"
              class="text-orange-600 text-2xl dark:text-orange-300"
            />
          </div>
          <div class="text-3xl font-bold text-orange-700 mb-1 dark:text-orange-200">
            {{ leagueAverages.lowestPoints }}
          </div>
          <div class="text-xs text-slate-600 uppercase font-bold tracking-wider dark:text-slate-300">
            Lowest Score
          </div>
        </div>

        <div class="flex flex-col justify-center items-center p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg shadow-sm dark:from-violet-950/70 dark:to-slate-900 dark:border-violet-800">
          <div class="mb-2">
            <Icon
              name="i-lucide-calendar"
              class="text-purple-600 text-2xl dark:text-violet-300"
            />
          </div>
          <div class="text-3xl font-bold text-purple-700 mb-1 dark:text-violet-200">
            {{ leagueAverages.weeksPlayed }}/38
          </div>
          <div class="text-xs text-slate-600 uppercase font-bold tracking-wider dark:text-slate-300">
            Weeks Played
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-8"
    >
      <Icon
        name="carbon:analytics"
        size="48"
        class="mx-auto text-slate-400 mb-2 dark:text-slate-500"
      />
      <p class="text-slate-500 mb-2 dark:text-slate-400">
        Statistics will appear after matches
      </p>
      <UBadge
        color="neutral"
        variant="soft"
        label="Awaiting results..."
      />
    </div>
  </WeeklySummaryCard>
</template>
