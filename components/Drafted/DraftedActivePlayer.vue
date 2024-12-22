<script setup lang="ts">
import type { DraftedPlayer } from '~/types/DraftedPlayer';

const props = defineProps({
  draftedPlayer: {
    type: Object as PropType<DraftedPlayer>,
    default: null,
  },
  activeGameweek: {
    type: Number,
    required: true,
  },
});

const findActiveGameweekPlayer = computed(() => {
  const player = props.draftedPlayer;

  if (player.transfers.some(x => x.transfer_week <= props.activeGameweek)) {
    return player.transfers.findLast(
      x => x.transfer_week <= props.activeGameweek,
    );
  }
  else {
    return player;
  }
});
</script>

<template>
  <div class="player-container">
    <DraftedPlayerWithPoints
      :is-transfer="true"
      :drafted-player="findActiveGameweekPlayer"
    />
  </div>
</template>
