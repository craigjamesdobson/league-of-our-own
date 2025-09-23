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
      <h3 class="text-lg font-bold text-slate-700 mb-2">
        Gameweek {{ currentGameweek }}
      </h3>
      <p class="text-slate-500 mb-4">
        Matches are currently in progress or yet to be played
      </p>

      <div class="space-y-2 mb-6">
        <Tag
          value="Results pending..."
          severity="info"
          class="text-sm"
        />
      </div>

      <div class="bg-slate-50 rounded-lg p-4">
        <p class="text-sm text-slate-600 mb-2">
          📊 Weekly statistics will appear here once match results are available
        </p>
        <p class="text-xs text-slate-500">
          Check back after the gameweek concludes
        </p>
      </div>
    </div>
  </WeeklySummaryCard>
</template>
