<script setup lang="ts">
import type { WeeklyData, WeeklyWinners } from '@/types/Table';
import WeeklySummaryCard from '@/components/Dashboard/WeeklySummaryCard.vue';

defineProps({
  weeklyData: {
    type: Array as PropType<WeeklyData[]>,
    default: () => [],
  },
  weeklyWinners: {
    type: Array as PropType<WeeklyWinners[]>,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  hasResults: {
    type: Boolean,
    default: false,
  },
});

// Get current week's top performers from weekly data
const getTopPerformers = (weeklyData: WeeklyData[]) => {
  if (!weeklyData || weeklyData.length === 0) return [];

  const sorted = [...weeklyData].sort((a, b) => b.week_points - a.week_points);

  // Get the highest score
  const highestScore = sorted[0]?.week_points || 0;

  // Get all teams with the highest score (joint first place)
  const firstPlaceTeams = sorted.filter(team => team.week_points === highestScore);

  // Get remaining teams after removing first place teams
  const remainingTeams = sorted.filter(team => team.week_points < highestScore);

  // Calculate how many more teams we need to reach 5 total
  const spotsRemaining = 5 - firstPlaceTeams.length;

  // Take the remaining teams to fill up to 5 total
  const additionalTeams = remainingTeams.slice(0, Math.max(0, spotsRemaining));

  return [...firstPlaceTeams, ...additionalTeams];
};

// Helper to determine if a team is in joint first place
const isJointFirst = (team: WeeklyData, allTeams: WeeklyData[]) => {
  if (!allTeams || allTeams.length === 0) return false;
  const sortedTeams = [...allTeams].sort((a, b) => b.week_points - a.week_points);
  const highestScore = sortedTeams[0]?.week_points || 0;
  return team.week_points === highestScore;
};

// Helper to get the actual position of a team
const getActualPosition = (team: WeeklyData, allTeams: WeeklyData[]) => {
  if (!allTeams || allTeams.length === 0) return 1;
  const sortedTeams = [...allTeams].sort((a, b) => b.week_points - a.week_points);
  return sortedTeams.findIndex(t => t.drafted_team_id === team.drafted_team_id) + 1;
};
</script>

<template>
  <WeeklySummaryCard
    :is-loading="isLoading"
  >
    <div
      v-if="weeklyData && weeklyData.length > 0 && (hasResults || weeklyData.some(team => team.week_points > 0))"
      class="flex h-full flex-col justify-evenly"
    >
      <div
        v-for="team in getTopPerformers(weeklyData)"
        :key="team.drafted_team_id"
        class="flex items-center justify-between p-4 rounded-lg flex-1 mb-2 last:mb-0"
        :class="{
          'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-sm': isJointFirst(team, weeklyData),
          'bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200': !isJointFirst(team, weeklyData) && getActualPosition(team, weeklyData) <= 3,
          'bg-gray-50 border border-gray-200': !isJointFirst(team, weeklyData) && getActualPosition(team, weeklyData) > 3,
        }"
      >
        <div class="flex items-center space-x-4">
          <div
            class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
            :class="{
              'bg-yellow-500 text-white': isJointFirst(team, weeklyData),
              'bg-slate-400 text-white': !isJointFirst(team, weeklyData),
            }"
          >
            <Icon
              v-if="isJointFirst(team, weeklyData)"
              name="carbon:star-filled"
              size="16"
            />
            <span v-else>{{ getActualPosition(team, weeklyData) }}</span>
          </div>
          <div class="text-left">
            <div class="font-bold text-lg text-slate-800 uppercase">
              {{ team.team_name }}
            </div>
            <div class="text-sm text-slate-600 uppercase">
              {{ team.team_owner }}
            </div>
          </div>
        </div>
        <div class="text-right flex flex-col items-end space-y-1">
          <Badge
            :value="team.week_points.toString()"
            severity="success"
            size="large"
            class="font-bold text-lg px-3 py-2"
          />
          <div class="text-xs text-slate-500 font-medium uppercase tracking-wide">
            Points
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-8"
    >
      <div class="text-slate-500 mb-2">
        <Icon
          name="carbon:trophy"
          size="48"
          class="mx-auto text-slate-400 mb-2"
        />
        <p v-if="hasResults">
          No performance data available yet
        </p>
        <p v-else>
          Gameweek in progress
        </p>
      </div>
      <Tag
        v-if="hasResults"
        severity="secondary"
        value="Waiting for results..."
      />
      <Tag
        v-else
        severity="secondary"
        value="Awaiting final results..."
      />
    </div>
  </WeeklySummaryCard>
</template>
