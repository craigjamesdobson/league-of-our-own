<script lang="ts" setup>
import { usePlayerStore } from '@/stores/players';
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
  <SkeletonPlayers v-if="!playerStore.isLoaded" />
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
              <Player :player="player" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
