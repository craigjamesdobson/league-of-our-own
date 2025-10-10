<script setup lang="ts">
import type { PropType } from 'vue';
import type { PositionMover } from '@/types/Dashboard';

defineProps({
  team: {
    type: Object as PropType<PositionMover>,
    required: true,
  },
  variant: {
    type: String as PropType<'riser' | 'faller'>,
    required: true,
  },
});
</script>

<template>
  <div
    class="position-mover-card"
    :class="variant === 'riser' ? 'position-mover-card--riser' : 'position-mover-card--faller'"
  >
    <div class="flex items-center space-x-3">
      <div class="text-left">
        <div class="font-bold text-sm text-slate-800 uppercase">
          {{ team.team_name }}
        </div>
        <div class="text-xs text-slate-600 uppercase">
          {{ team.team_owner }}
        </div>
      </div>
    </div>
    <div class="flex items-center space-x-3">
      <div class="text-sm text-slate-600 font-medium flex items-center gap-1">
        {{ team.prev_week_position }}
        <Icon
          name="lucide:arrow-right"
          size="12"
        />
        {{ team.currentPosition }}
      </div>
      <Badge
        :value="variant === 'riser' ? `+${team.positionChange}` : team.positionChange.toString()"
        :severity="variant === 'riser' ? 'success' : 'danger'"
        class="font-bold"
      />
    </div>
  </div>
</template>

<style scoped>
.position-mover-card {
  @apply flex items-center justify-between p-4 rounded-lg border;
}

.position-mover-card--riser {
  @apply bg-gradient-to-r from-green-50 to-emerald-50 border-green-200;
}

.position-mover-card--faller {
  @apply bg-gradient-to-r from-red-50 to-rose-50 border-red-200;
}
</style>
