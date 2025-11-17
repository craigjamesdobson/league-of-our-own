<script setup lang="ts">
import type { PropType } from 'vue';
import type { PositionMover } from '@/types/Dashboard';
import PositionMoverCard from '@/components/Dashboard/PositionMoverCard.vue';

defineProps({
  teams: {
    type: Array as PropType<PositionMover[]>,
    required: true,
  },
  variant: {
    type: String as PropType<'riser' | 'faller'>,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div
    v-if="teams.length > 0"
    class="flex-1 flex flex-col"
    :class="{ 'mt-6': variant === 'faller' }"
  >
    <h4
      class="text-sm font-bold mb-4 flex items-center uppercase tracking-wide"
      :class="variant === 'riser' ? 'text-green-700' : 'text-red-700'"
    >
      <Icon
        :name="icon"
        size="16"
        class="mr-2"
        :class="variant === 'riser' ? 'text-green-600' : 'text-red-600'"
      />
      {{ title }}
    </h4>

    <div class="flex-1 flex flex-col justify-evenly space-y-2">
      <PositionMoverCard
        v-for="team in teams"
        :key="team.drafted_team_id"
        :team="team"
        :variant="variant"
      />
    </div>
  </div>
</template>
