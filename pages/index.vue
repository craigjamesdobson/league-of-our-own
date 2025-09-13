<script setup lang="ts">
import { useHomepageDashboard } from '@/composables/useHomepageDashboard';
import { useTableStore } from '@/stores/table';

import WeeklySummaryCard from '@/components/Dashboard/WeeklySummaryCard.vue';
import TopPerformers from '@/components/Dashboard/TopPerformers.vue';
import PositionMovers from '@/components/Dashboard/PositionMovers.vue';
import WeeklyStats from '@/components/Dashboard/WeeklyStats.vue';
import WeeklyTransfers from '@/components/Dashboard/WeeklyTransfers.vue';
import TopPerformingPlayers from '@/components/Dashboard/TopPerformingPlayers.vue';

const dashboard = useHomepageDashboard();
const tableStore = useTableStore();

const currentGameweek = computed(() => dashboard.getCurrentGameweek());
const hasResults = computed(() => dashboard.hasResults());
const weeklyData = computed(() => tableStore.weeklyData || []);
const weeklyWinners = computed(() => tableStore.weeklyWinners || []);
const isLoading = computed(() => dashboard.isLoading.value || tableStore.weeklyData === undefined);

const leagueAverages = computed(() => dashboard.leagueAverages.value);

const positionMovers = computed(() => {
  if (!weeklyData.value || weeklyData.value.length === 0) {
    return { biggestRisers: [], biggestFallers: [] };
  }
  return dashboard.getPositionMovers(weeklyData.value);
});

const transfers = computed(() => dashboard.weeklyTransfers.value);
const topPositionPlayers = computed(() => dashboard.topPositionPlayers.value);

onMounted(async () => {
  await dashboard.loadDashboardData();
});

watchEffect(() => {
  if (dashboard.error.value) {
    console.error('Dashboard error:', dashboard.error.value);
  }
});
</script>

<template>
  <div class="min-h-full">
    <!-- Header Section -->
    <div class="text-center mb-8">
      <div class="inline-flex flex-col gap-5 justify-center text-slate-800">
        <h1 class="text-4xl uppercase font-black">
          Summary Dashboard
        </h1>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="mx-auto">
      <!-- Dashboard Layout -->
      <div class="space-y-12">
        <!-- OVERALL SEASON SUMMARY SECTION -->
        <div>
          <div class="flex items-center gap-3 mb-8">
            <Icon
              name="carbon:analytics"
              size="28"
              class="text-slate-600"
            />
            <h2 class="text-xl md:text-2xl font-black uppercase text-slate-800 tracking-wide">
              Overall Season Summary
            </h2>
          </div>

          <div class="space-y-8">
            <!-- Overall League Statistics -->
            <div class="w-full">
              <h2 class="text-base md:text-lg font-black uppercase text-slate-800 tracking-wide mb-4">
                LEAGUE STATISTICS
              </h2>
              <WeeklyStats
                :league-averages="leagueAverages"
                :is-loading="isLoading"
              />
            </div>

            <!-- Top Performing Players -->
            <div class="w-full">
              <h2 class="text-base md:text-lg font-black uppercase text-slate-800 tracking-wide mb-4">
                TOP PERFORMING PLAYERS
              </h2>
              <TopPerformingPlayers
                :top-position-players="topPositionPlayers"
                :is-loading="isLoading"
              />
            </div>
          </div>
        </div>

        <hr class="border-slate-300">

        <!-- GAMEWEEK SPECIFIC SUMMARY SECTION -->
        <div>
          <div class="mb-8">
            <!-- Title -->
            <div class="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <div class="flex items-center gap-3">
                <Icon
                  name="carbon:calendar"
                  size="28"
                />
                <h2 class="text-xl md:text-2xl font-black uppercase text-slate-800 tracking-wide">
                  Gameweek {{ currentGameweek }} Summary
                </h2>
              </div>

              <!-- Status Message - Inline on desktop -->
              <div
                v-if="hasResults"
                class="inline-flex items-center px-3 py-1 rounded-full bg-green-100 border border-green-600 self-start"
              >
                <Icon
                  name="carbon:checkmark"
                  size="16"
                  class="mr-1 text-green-600"
                />
                <span class="text-sm text-green-700 font-medium">
                  Results available
                </span>
              </div>
              <div
                v-else
                class="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 border border-amber-600 self-start"
              >
                <Icon
                  name="carbon:time"
                  size="16"
                  class="mr-1 text-amber-600"
                />
                <span class="text-sm text-amber-700 font-medium">
                  In progress
                </span>
              </div>
            </div>
          </div>

          <div class="space-y-8">
            <!-- Weekly Transfers -->
            <div class="w-full">
              <h2 class="text-base md:text-lg font-black uppercase text-slate-800 tracking-wide mb-4">
                WEEKLY TRANSFERS
              </h2>
              <WeeklyTransfers
                :transfers="transfers"
                :current-gameweek="currentGameweek"
                :is-loading="isLoading"
                :has-results="hasResults"
              />
            </div>

            <!-- Top Performers & Position Movers - Stacked on mobile -->
            <div class="flex flex-col space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:auto-rows-fr md:gap-8">
              <!-- Top Performers -->
              <div class="flex flex-col">
                <h2 class="text-base md:text-lg font-black uppercase text-slate-800 tracking-wide mb-4">
                  TOP PERFORMERS
                </h2>
                <TopPerformers
                  :weekly-data="weeklyData"
                  :weekly-winners="weeklyWinners"
                  :is-loading="isLoading"
                  :has-results="hasResults"
                />
              </div>

              <!-- Position Movers -->
              <div class="flex flex-col">
                <h2 class="text-base md:text-lg font-black uppercase text-slate-800 tracking-wide mb-4">
                  POSITION MOVERS
                </h2>
                <div class="flex-1">
                  <PositionMovers
                    :position-movers="positionMovers"
                    :is-loading="isLoading"
                    :has-results="hasResults"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-if="dashboard.error.value"
        class="max-w-2xl mx-auto mt-6"
      >
        <WeeklySummaryCard title="Error">
          <div class="text-center py-8">
            <Icon
              name="carbon:warning"
              size="48"
              class="mx-auto text-red-400 mb-2"
            />
            <p class="text-red-600 mb-2">
              Failed to load dashboard data
            </p>
            <p class="text-sm text-slate-500 mb-4">
              {{ dashboard.error.value }}
            </p>
            <Button
              label="Try Again"
              :loading="dashboard.isLoading.value"
              @click="dashboard.loadDashboardData"
            />
          </div>
        </WeeklySummaryCard>
      </div>
    </div>
  </div>
</template>
