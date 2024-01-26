<template>
  <div class="flex items-center w-full">
    <span class="w-1/12 p-2">{{ player.player_id }}</span>
    <span class="w-2/12 p-2">
      <img
        class="w-6 h-6 rounded-full shadow-md"
        :src="player.image"
        :alt="player.web_name"
        @error="loadPlayerFallbackImage"
      />
    </span>
    <span class="w-1/12 p-2">{{ player.team_short_name }}</span>
    <span class="w-5/12 p-2 text-center">{{ player.web_name }}</span>
    <span class="w-1/12 p-2 text-center">{{ player.cost.toFixed(1) }}</span>
    <span
      v-if="player.unavailable_for_season"
      class="flex items-center justify-end w-2/12 p-2"
      :class="player.status"
    >
      <span
        class="flex justify-center w-3 h-3 mr-2 leading-tight bg-red-500 rounded-full"
      />
    </span>
    <span
      v-if="player.is_unavailable && !player.unavailable_for_season"
      class="flex items-center justify-end w-2/12 p-2"
      :class="player.status"
    >
      <span
        class="flex justify-center w-3 h-3 mr-2 leading-tight bg-yellow-400 rounded-full"
      />
    </span>
    <span
      v-else-if="!player.is_unavailable"
      class="flex items-center justify-end w-2/12 p-2"
      :class="player.status"
    >
      <span
        class="flex justify-center w-3 h-3 mr-2 leading-tight bg-green-400 rounded-full"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~/types/Player';

const { player } = defineProps<{
  player: Player;
}>();
</script>

<style scoped></style>
