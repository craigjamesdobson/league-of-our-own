<script setup lang="ts">
defineProps({
  currentGameweek: {
    type: Number,
    default: 1,
  },
});
</script>

<template>
  <WeeklySummaryCard title="Upcoming Gameweek">
    <div class="text-center py-8">
      <Icon
        name="carbon:soccer"
        size="64"
        class="mx-auto text-slate-400 mb-4"
      />
      <h3 class="text-lg font-bold text-slate-700 mb-2 dark:text-slate-200">
        Gameweek {{ currentGameweek }}
      </h3>
      <p class="text-slate-500 mb-4 dark:text-slate-400">
        Matches are currently in progress or yet to be played
      </p>

      <div class="space-y-2 mb-6">
        <UBadge
          label="Results pending..."
          color="info"
          variant="soft"
        />
      </div>

      <div class="bg-slate-50 rounded-lg border border-slate-200 p-4 dark:bg-slate-800/70 dark:border-slate-700">
        <p class="text-sm text-slate-600 mb-2 dark:text-slate-300">
          Weekly statistics will appear here once match results are available
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Check back after the gameweek concludes
        </p>
      </div>
    </div>
  </WeeklySummaryCard>
</template>
