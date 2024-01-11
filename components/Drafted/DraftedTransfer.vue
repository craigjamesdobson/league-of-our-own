<template>
  <div class="player-container">
    <DraftedPlayer
      :is-transfer="true"
      :drafted-player="draftedPlayer.transfers.at(-1)!.player"
    />
    <div
      class="prev-transfer absolute left-0 z-10 gap-5 flex flex-col items-center justify-center invisible w-full p-2.5 text-center bg-green-200 top-full"
    >
      <div
        v-for="(transferredPlayer, index) in draftedPlayer.transfers"
        :key="transferredPlayer.player.player_id"
      >
        {{
          draftedPlayer.transfers[index - 1]?.player.web_name ??
          draftedPlayer.web_name
        }}
        was transferred out in gameweek
        {{ transferredPlayer.transfer_week }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DraftedPlayer } from '~/types/DraftedPlayer';

const { draftedPlayer } = defineProps({
  draftedPlayer: {
    type: Object as PropType<DraftedPlayer>,
    default: null,
  },
});
</script>

<style scoped></style>
