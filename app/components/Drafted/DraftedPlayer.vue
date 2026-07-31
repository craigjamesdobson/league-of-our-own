<script setup lang="ts">
import type { DraftedPlayerWithWeeklyStats, DraftedTransferWithWeeklyStats } from '@/types/DraftedPlayer';

const props = defineProps({
  draftedPlayer: {
    type: Object as PropType<DraftedPlayerWithWeeklyStats | DraftedTransferWithWeeklyStats>,
    default: null,
  },
  transferCount: { type: Number, default: 0 },
});
</script>

<template>
  <div
    class="h-full w-full min-w-0"
    :class="{
      'opacity-25': props.draftedPlayer.data.unavailable_for_season,
    }"
  >
    <DraftedPlayerRow
      :drafted-player="props.draftedPlayer"
      :transfer-count="props.transferCount"
      mode="value"
      show-image
    />
  </div>
</template>
