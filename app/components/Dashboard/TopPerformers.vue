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

const { isFavouriteTeam } = useFavouriteTeam();

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
  'bg-gradient-to-r from-yellow-50 via-yellow-100/80 to-amber-50 border-2 border-yellow-300 shadow-sm dark:from-yellow-900/45 dark:via-yellow-950/35 dark:to-slate-900 dark:border-yellow-600/80': isWinner,
  'bg-gray-50 border border-gray-200 dark:bg-slate-800/70 dark:border-slate-700': !isWinner,
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
            <div class="flex items-center gap-1.5 font-bold text-lg text-slate-800 uppercase dark:text-slate-100">
              {{ team.team_name }}
              <Icon
                v-if="isFavouriteTeam(team.drafted_team_id)"
                name="lucide:user-round-check"
                size="16"
                class="shrink-0 text-amber-500"
                aria-hidden="true"
              />
            </div>
            <div class="text-sm text-slate-600 uppercase dark:text-slate-300">
              {{ team.team_owner }}
            </div>
          </div>
        </div>
        <div class="text-right flex flex-col items-end space-y-1">
          <UBadge
            :label="team.week_points.toString()"
            color="success"
            size="lg"
            :class="getBadgeClasses(team.isWinner)"
          />
          <div class="text-xs text-slate-500 font-medium uppercase tracking-wide dark:text-slate-400">
            Points
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-8"
    >
      <div class="text-slate-500 mb-2 dark:text-slate-400">
        <Icon
          name="carbon:trophy"
          size="48"
          class="mx-auto text-slate-400 mb-2 dark:text-slate-500"
        />
        <p v-if="hasResults">
          No performance data available yet
        </p>
        <p v-else>
          Gameweek in progress
        </p>
      </div>
      <UBadge
        v-if="hasResults"
        color="neutral"
        variant="soft"
        label="Waiting for results..."
      />
      <UBadge
        v-else
        color="neutral"
        variant="soft"
        label="Awaiting final results..."
      />
    </div>
  </WeeklySummaryCard>
</template>
