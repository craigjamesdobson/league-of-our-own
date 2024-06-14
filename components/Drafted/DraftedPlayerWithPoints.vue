<script setup lang="ts">
import type { DraftedPlayer, DraftedTransfer } from '@/types/DraftedPlayer';

const props = defineProps({
  draftedPlayer: {
    type: Object as PropType<DraftedPlayer | DraftedTransfer>,
    default: null
  },
  isTransfer: { type: Boolean, default: false }
});
</script>

<template>
  <div class="flex h-full w-full items-center gap-2">
    <span class="w-1/12 p-2">{{ props.draftedPlayer?.data.player_id }}</span>
    <span class="w-2/12 p-2">{{
      props.draftedPlayer.data.team_short_name
    }}</span>
    <span class="w-7/12 p-2 text-center text-sm"
      >{{ props.draftedPlayer.data.web_name }}
      <Icon
        v-if="props.isTransfer"
        class="ml-2"
        size="18"
        name="ic:round-swap-horiz"
      />
    </span>
    <span
      v-if="props.draftedPlayer.points !== undefined"
      class="w-2/12 p-2 text-center"
    >
      {{ props.draftedPlayer.points }}
    </span>
    <span v-else class="w-2/12 p-2 text-center">
      {{ props.draftedPlayer.data.cost!.toFixed(1) }}
    </span>
  </div>
</template>

<style scoped></style>
