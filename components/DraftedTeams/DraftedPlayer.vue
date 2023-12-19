<script setup lang="ts">
import type {
  CompleteDraftedPlayer,
  DraftedTransfer,
} from '@/logic/drafted-teams/interfaces/DraftedTeamData';

const props = defineProps({
  draftedPlayer: {
    type: Object as PropType<CompleteDraftedPlayer | DraftedTransfer>,
    default: null,
  },
  isTransfer: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="flex items-center w-full border-b border-gray-100"
    :class="{
      'opacity-25': props.draftedPlayer?.unavailable_for_season,
    }"
  >
    <span class="w-1/12 p-2">{{ props.draftedPlayer?.player_id }}</span>
    <span class="w-2/12 p-2">
      <img
        class="w-6 h-6 m-auto rounded-full shadow-md"
        :src="props.draftedPlayer?.image"
        :alt="props.draftedPlayer?.web_name"
        @error="loadPlayerFallbackImage"
      />
    </span>
    <span class="w-2/12 p-2">{{ props.draftedPlayer?.team_short_name }}</span>
    <span class="w-5/12 p-2 text-sm text-center"
      >{{ props.draftedPlayer?.web_name }}
      <Icon
        v-if="props.isTransfer"
        class="ml-2"
        size="18"
        name="ic:round-swap-horiz"
    /></span>
    <span class="w-2/12 p-2 text-center">
      {{ props.draftedPlayer?.cost }}
    </span>
  </div>
</template>

<style scoped></style>
