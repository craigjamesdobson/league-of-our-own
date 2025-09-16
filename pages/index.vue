<script setup lang="ts">
import { useHomepageDashboard } from '@/composables/useHomepageDashboard';
import { useTableStore } from '@/stores/table';

import TopPerformers from '@/components/Dashboard/TopPerformers.vue';
import PositionMovers from '@/components/Dashboard/PositionMovers.vue';
import WeeklyStats from '@/components/Dashboard/WeeklyStats.vue';
import WeeklyTransfers from '@/components/Dashboard/WeeklyTransfers.vue';
import TopPerformingPlayers from '@/components/Dashboard/TopPerformingPlayers.vue';

const dashboard = useHomepageDashboard();
const tableStore = useTableStore();

const currentGameweek = computed(() => dashboard.getCurrentGameweek());
const hasGameweekData = computed(() => dashboard.hasGameweekData());
const hasResults = computed(() => dashboard.hasResults());
const weeklyData = computed(() => tableStore.weeklyData || []);
const weeklyWinners = computed(() => tableStore.weeklyWinners || []);
const isLoading = computed(() => dashboard.isLoading.value);
const isGameweekLoading = computed(() => isLoading.value || (hasGameweekData.value && tableStore.weeklyData === undefined));

const leagueAverages = computed(() => dashboard.leagueAverages.value);

const positionMovers = computed(() => {
  if (!weeklyData.value || weeklyData.value.length === 0) {
    return { biggestRisers: [], biggestFallers: [] };
  }
  return dashboard.getPositionMovers(weeklyData.value);
});

const transfers = computed(() => dashboard.weeklyTransfers.value);
const topPositionPlayers = computed(() => dashboard.topPositionPlayers.value);

const refreshPage = () => {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

onMounted(async () => {
  await dashboard.loadDashboardData();
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
                <h2
                  v-if="isLoading"
                  class="text-xl md:text-2xl font-black uppercase text-slate-800 tracking-wide"
                >
                  Loading Gameweek Data...
                </h2>
                <h2
                  v-else-if="!hasGameweekData"
                  class="text-xl md:text-2xl font-black uppercase text-slate-800 tracking-wide"
                >
                  Gameweek Data Unavailable
                </h2>
                <h2
                  v-else
                  class="text-xl md:text-2xl font-black uppercase text-slate-800 tracking-wide"
                >
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

          <!-- Gameweek Content -->
          <div
            v-if="hasGameweekData && !isGameweekLoading"
            class="space-y-8"
          >
            <!-- Weekly Transfers -->
            <div class="w-full">
              <h2 class="text-base md:text-lg font-black uppercase text-slate-800 tracking-wide mb-4">
                WEEKLY TRANSFERS
              </h2>
              <WeeklyTransfers
                :transfers="transfers"
                :current-gameweek="currentGameweek || undefined"
                :is-loading="isGameweekLoading"
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
                  :is-loading="isGameweekLoading"
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
                    :is-loading="isGameweekLoading"
                    :has-results="hasResults"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Gameweek Loading State -->
          <div
            v-else-if="isLoading || isGameweekLoading"
            class="space-y-8"
          >
            <!-- Show skeleton loading for gameweek content -->
            <div class="w-full">
              <h2 class="text-base md:text-lg font-black uppercase text-slate-800 tracking-wide mb-4">
                WEEKLY TRANSFERS
              </h2>
              <WeeklyTransfers
                :transfers="[]"
                :current-gameweek="currentGameweek || undefined"
                :is-loading="true"
                :has-results="false"
              />
            </div>

            <div class="flex flex-col space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:auto-rows-fr md:gap-8">
              <div class="flex flex-col">
                <h2 class="text-base md:text-lg font-black uppercase text-slate-800 tracking-wide mb-4">
                  TOP PERFORMERS
                </h2>
                <TopPerformers
                  :weekly-data="[]"
                  :weekly-winners="[]"
                  :is-loading="true"
                  :has-results="false"
                />
              </div>
              <div class="flex flex-col">
                <h2 class="text-base md:text-lg font-black uppercase text-slate-800 tracking-wide mb-4">
                  POSITION MOVERS
                </h2>
                <div class="flex-1">
                  <PositionMovers
                    :position-movers="{ biggestRisers: [], biggestFallers: [] }"
                    :is-loading="true"
                    :has-results="false"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Gameweek Error State -->
          <div
            v-else
            class="text-center py-12"
          >
            <Icon
              name="carbon:warning"
              size="48"
              class="text-amber-500 mb-4"
            />
            <h3 class="text-lg font-semibold text-slate-800 mb-2">
              Gameweek Data Unavailable
            </h3>
            <p class="text-slate-600 mb-4">
              Unable to load current gameweek information. Please try refreshing the page.
            </p>
            <Button
              label="Refresh Page"
              icon="pi pi-refresh"
              @click="refreshPage"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
