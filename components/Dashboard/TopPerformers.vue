<script setup lang="ts">
import type { WeeklyData } from '@/types/Table';
import WeeklySummaryCard from '@/components/Dashboard/WeeklySummaryCard.vue';

const props = defineProps({
  weeklyData: {
    type: Array as PropType<WeeklyData[]>,
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

type EnhancedTeamData = WeeklyData & {
  isWinner: boolean;
};

const topPerformersWithWinnerStatus = computed((): EnhancedTeamData[] => {
  if (!props.weeklyData || props.weeklyData.length === 0) return [];

  const sorted = [...props.weeklyData].sort((a, b) => b.week_points - a.week_points);

  // Get winners based on the weekly_winner boolean from the data
  const firstPlaceTeams = sorted.filter(team => team.weekly_winner);
  const remainingTeams = sorted.filter(team => !team.weekly_winner);

  // Get top 5 teams (handling ties)
  const spotsRemaining = 5 - firstPlaceTeams.length;
  const additionalTeams = remainingTeams.slice(0, Math.max(0, spotsRemaining));
  const topTeams = [...firstPlaceTeams, ...additionalTeams];

  // Use the existing weekly_winner property
  return topTeams.map(team => ({
    ...team,
    isWinner: team.weekly_winner,
  }));
});

const getTeamContainerClasses = (isWinner: boolean) => ({
  'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-sm': isWinner,
  'bg-gray-50 border border-gray-200': !isWinner,
});

const getPositionIconClasses = (isWinner: boolean) => ({
  'bg-yellow-500 text-white': isWinner,
  'bg-slate-400 text-white': !isWinner,
});

const getBadgeClasses = (isWinner: boolean) => [
  'font-bold text-lg px-3 py-2',
  isWinner ? '!bg-yellow-500 !text-white' : '',
];
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
        v-for="(team, index) in topPerformersWithWinnerStatus"
        :key="team.drafted_team_id"
        class="flex items-center justify-between p-4 rounded-lg flex-1 mb-2 last:mb-0"
        :class="getTeamContainerClasses(team.isWinner)"
      >
        <div class="flex items-center space-x-4">
          <div
            class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
            :class="getPositionIconClasses(team.isWinner)"
          >
            <Icon
              v-if="team.isWinner"
              name="carbon:star-filled"
              size="16"
            />
            <span v-else>{{ index + 1 }}</span>
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
            :class="getBadgeClasses(team.isWinner)"
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
