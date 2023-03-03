<template>
  <div
    class="flex items-center w-full border-b border-gray-100"
    :class="{
      'opacity-25': props.draftedPlayer?.unavailableForSeason,
    }"
  >
    <span class="w-1/12 p-2">{{ props.draftedPlayer?.id }}</span>
    <span class="w-2/12 p-2">
      <img
        class="w-6 h-6 m-auto rounded-full shadow-md"
        :src="props.draftedPlayer?.image"
        :alt="props.draftedPlayer?.webName"
        @error="loadPlayerFallbackImage"
      />
    </span>
    <span class="w-2/12 p-2">{{ props.draftedPlayer?.teamNameShort }}</span>
    <span class="w-5/12 p-2 text-sm text-center">{{
      props.draftedPlayer?.webName
    }}</span>
    <span class="w-2/12 p-2 text-center">
      {{ props.draftedPlayer?.price }}
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  CompleteDraftedPlayer,
  DraftedTransfer,
} from "~~/modules/drafted-teams/interfaces/DraftedTeamData";

const props = defineProps({
  draftedPlayer: Object as PropType<CompleteDraftedPlayer | DraftedTransfer>,
});
</script>

<style scoped></style>
