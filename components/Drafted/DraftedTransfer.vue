<script setup lang="ts">
import type { DraftedPlayer } from '~/types/DraftedPlayer';

const { draftedPlayer } = defineProps({
  draftedPlayer: {
    type: Object as PropType<DraftedPlayer>,
    default: null,
  },
});
</script>

<template>
  <div class="player-container">
    <DraftedPlayer
      :transfer-count="draftedPlayer.transfers.length"
      :drafted-player="draftedPlayer.transfers.at(-1)"
    />
  </div>
</template>
