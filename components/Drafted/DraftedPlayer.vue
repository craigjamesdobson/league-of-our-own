<script setup lang="ts">
import type { DraftedPlayer, DraftedTransfer } from '@/types/DraftedPlayer';

const { draftedPlayer, isTransfer } = defineProps({
  draftedPlayer: {
    type: Object as PropType<DraftedPlayer | DraftedTransfer['player']>,
    default: null,
  },
  isTransfer: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="flex items-center w-full h-full gap-2"
    :class="{
      'opacity-25': draftedPlayer.unavailable_for_season,
    }"
  >
    <span class="w-1/12 p-2">{{ draftedPlayer?.player_id }}</span>
    <span class="w-2/12 p-2">
      <img
        class="w-6 h-6 m-auto rounded-full shadow-md"
        :src="draftedPlayer.image"
        :alt="draftedPlayer.web_name"
        @error="loadPlayerFallbackImage"
      />
    </span>
    <span class="w-2/12 p-2">{{ draftedPlayer.team_short_name }}</span>
    <span class="w-5/12 p-2 text-sm text-center"
      >{{ draftedPlayer.web_name }}
      <Icon v-if="isTransfer" class="ml-2" size="18" name="ic:round-swap-horiz"
    /></span>
    <span class="w-2/12 p-2 text-center">
      {{ draftedPlayer.cost.toFixed(1) }}
    </span>
  </div>
</template>

<style scoped></style>
