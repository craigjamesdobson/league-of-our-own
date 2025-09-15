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
          class="flex flex-col justify-center items-center p-5 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-lg shadow-sm"
        >
          <div class="mb-2">
            <Skeleton
              shape="circle"
              size="2rem"
            />
          </div>
          <div class="mb-1">
            <Skeleton
              width="3rem"
              height="2.25rem"
            />
          </div>
          <div>
            <Skeleton
              width="5rem"
              height="0.75rem"
            />
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
        <div class="flex flex-col justify-center items-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm ">
          <div class="mb-2">
            <i class="pi pi-chart-bar text-blue-600 text-2xl" />
          </div>
          <div class="text-3xl font-bold text-blue-700 mb-1">
            {{ Math.round(leagueAverages.averagePoints) }}
          </div>
          <div class="text-xs text-slate-600 uppercase font-bold tracking-wider">
            Average Points
          </div>
        </div>

        <div class="flex flex-col justify-center items-center p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm ">
          <div class="mb-2">
            <i class="pi pi-arrow-up text-green-600 text-2xl" />
          </div>
          <div class="text-3xl font-bold text-green-700 mb-1">
            {{ leagueAverages.highestPoints }}
          </div>
          <div class="text-xs text-slate-600 uppercase font-bold tracking-wider">
            Highest Score
          </div>
        </div>

        <div class="flex flex-col justify-center items-center p-5 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg shadow-sm ">
          <div class="mb-2">
            <i class="pi pi-arrow-down text-orange-600 text-2xl" />
          </div>
          <div class="text-3xl font-bold text-orange-700 mb-1">
            {{ leagueAverages.lowestPoints }}
          </div>
          <div class="text-xs text-slate-600 uppercase font-bold tracking-wider">
            Lowest Score
          </div>
        </div>

        <div class="flex flex-col justify-center items-center p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg shadow-sm ">
          <div class="mb-2">
            <i class="pi pi-calendar text-purple-600 text-2xl" />
          </div>
          <div class="text-3xl font-bold text-purple-700 mb-1">
            {{ leagueAverages.weeksPlayed }}/38
          </div>
          <div class="text-xs text-slate-600 uppercase font-bold tracking-wider">
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
        class="mx-auto text-slate-400 mb-2"
      />
      <p class="text-slate-500 mb-2">
        Statistics will appear after matches
      </p>
      <Tag
        severity="secondary"
        value="Awaiting results..."
      />
    </div>
  </WeeklySummaryCard>
</template>
