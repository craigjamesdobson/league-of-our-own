<script lang="ts" setup>
import { usePlayerStore } from '@/stores/players';
import { loadPlayerFallbackImage } from '@/helpers/images';
import type { Player } from '~/types/Player';

const router = useRouter();
const playerStore = usePlayerStore();
const selectedPlayer: Ref<Player | null> = ref(null);
const showDialog = ref(false);
const playerData = computed(() => playerStore.formatFilteredPlayersByPosition);

const setSelectedPlayerAndQueryParam = (playerID: number) => {
  selectedPlayer.value = playerStore.getPlayerByID(playerID) as Player;
  router.push({
    path: 'players',
    query: { id: playerID },
  });
  showDialog.value = true;
};
</script>

<template>
  <PlayerLoader v-if="!playerStore.isLoaded" />
  <div v-else>
    <PlayerModal v-model="showDialog" :selected-player="selectedPlayer" />
    <div v-for="(data, index) in playerData" :key="index">
      <h1 class="main-heading">
        {{ data.position }}
      </h1>
      <div class="flex justify-between mb-4 rounded-sm">
        <div class="w-full border-r border-gray-100">
          <div class="grid grid-cols-1 gap-1 md:grid-cols-2">
            <div
              v-for="player in data.players"
              :key="player.player_id"
              class="relative flex flex-col items-center justify-around w-full text-sm bg-white border-b border-gray-100 cursor-pointer"
              @click="setSelectedPlayerAndQueryParam(player.player_id)"
            >
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
                <span class="w-5/12 p-2 text-center">{{
                  player.web_name
                }}</span>
                <span class="w-1/12 p-2 text-center">{{
                  player.cost.toFixed(1)
                }}</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
