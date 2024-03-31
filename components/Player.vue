<template>
  <div class="flex w-full items-center">
    <span class="w-1/12 p-2">{{ player.player_id }}</span>
    <span class="w-2/12 p-2">
      <img
        class="h-6 w-6 rounded-full shadow-md"
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
      class="flex w-2/12 items-center justify-end p-2"
      :class="player.status"
    >
      <span
        class="mr-2 flex h-3 w-3 justify-center rounded-full bg-red-500 leading-tight"
      />
    </span>
    <span
      v-if="player.is_unavailable && !player.unavailable_for_season"
      class="flex w-2/12 items-center justify-end p-2"
      :class="player.status"
    >
      <span
        class="mr-2 flex h-3 w-3 justify-center rounded-full bg-yellow-400 leading-tight"
      />
    </span>
    <span
      v-else-if="!player.is_unavailable"
      class="flex w-2/12 items-center justify-end p-2"
      :class="player.status"
    >
      <span
        class="mr-2 flex h-3 w-3 justify-center rounded-full bg-green-400 leading-tight"
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
