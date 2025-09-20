<script setup lang="ts">
import type { PropType } from 'vue';
import WeeklySummaryCard from '@/components/Dashboard/WeeklySummaryCard.vue';
import PositionMoverSection from '@/components/Dashboard/PositionMoverSection.vue';
import type { PositionMovers } from '@/types/Dashboard';

defineProps({
  positionMovers: {
    type: Object as PropType<PositionMovers>,
    default: () => ({ biggestRisers: [], biggestFallers: [] }),
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
</script>

<template>
  <WeeklySummaryCard
    :is-loading="isLoading"
  >
    <div
      v-if="positionMovers.biggestRisers.length > 0 || positionMovers.biggestFallers.length > 0"
      class="flex-1 flex flex-col justify-between"
    >
      <PositionMoverSection
        :teams="positionMovers.biggestRisers"
        variant="riser"
        title="Biggest Risers"
        icon="tabler:chevrons-up"
      />

      <PositionMoverSection
        :teams="positionMovers.biggestFallers"
        variant="faller"
        title="Biggest Fallers"
        icon="tabler:chevrons-down"
      />
    </div>

    <div
      v-else
      class="text-center py-8"
    >
      <Icon
        name="carbon:arrows-vertical"
        size="48"
        class="mx-auto text-slate-400 mb-2"
      />
      <p class="text-slate-500 mb-2">
        <span v-if="hasResults">No significant position changes</span>
        <span v-else>Gameweek in progress</span>
      </p>
      <Tag
        v-if="hasResults"
        severity="secondary"
        value="Positions stable"
      />
      <Tag
        v-else
        severity="secondary"
        value="Awaiting final results..."
      />
    </div>
  </WeeklySummaryCard>
</template>
