<script setup lang="ts">
import type { DraftedPlayerWithWeeklyStats, DraftedTransferWithWeeklyStats } from '@/types/DraftedPlayer';
import { loadPlayerFallbackImage } from '@/utils/images';

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
    class="flex h-full w-full items-center gap-2"
    :class="{
      'opacity-25': props.draftedPlayer.data.unavailable_for_season,
    }"
  >
    <span class="w-1/12 p-2">{{ props.draftedPlayer?.data.player_id }}</span>
    <span class="w-2/12 p-2">
      <img
        class="m-auto h-6 w-6 rounded-full shadow-md"
        :src="props.draftedPlayer.data.image!"
        :alt="props.draftedPlayer.data.web_name!"
        @error="loadPlayerFallbackImage"
      >
    </span>
    <span class="w-2/12 p-2">{{
      props.draftedPlayer.data.team_short_name
    }}</span>
    <span class="flex justify-center gap-1 w-5/12 p-2 text-center text-sm whitespace-nowrap">{{
                                                                                               props.draftedPlayer.data.web_name }}
      <div
        v-if="props.transferCount > 0"
        class="flex items-center relative"
      >
        <Icon
          class="ml-1"
          size="20"
          name="fluent:arrow-swap-20-regular"
        />
        <div
          v-if="transferCount > 1"
          title="View transfer details"
          class="flex items-center justify-center text-[8px] border border-black rounded-full w-4 h-4 -mt-2"
        >
          {{ props.transferCount }}
        </div>
      </div>
    </span>
    <span
      v-if="props.draftedPlayer.points !== undefined"
      class="w-2/12 p-2 text-center"
    >
      {{ props.draftedPlayer.points }}
    </span>
    <span
      v-else
      class="w-2/12 p-2 text-center"
    >
      {{ props.draftedPlayer.data.cost!.toFixed(1) }}
    </span>
  </div>
</template>

<style scoped></style>
