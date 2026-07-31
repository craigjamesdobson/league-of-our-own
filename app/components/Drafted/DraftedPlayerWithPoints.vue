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
  <DraftedPlayerRow
    :drafted-player="props.draftedPlayer"
    :transfer-count="props.transferCount"
    mode="points"
    :show-image="false"
  />
</template>
