<template>
  <div class="player-container">
    <DraftedPlayer
      :is-transfer="true"
      :drafted-player="sortedTransfers.at(-1)!.player"
    />
  </div>
</template>

<script setup lang="ts">
import type { DraftedPlayer } from '~/types/DraftedPlayer';

const { draftedPlayer } = defineProps({
  draftedPlayer: {
    type: Object as PropType<DraftedPlayer>,
    default: null
  }
});

const sortedTransfers = computed(() => {
  return [...draftedPlayer.transfers].sort(
    (a, b) => a.transfer_week - b.transfer_week
  );
});
</script>

<style scoped></style>
