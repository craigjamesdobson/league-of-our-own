<script lang="ts" setup>
import { usePlayerStore } from '@/stores/players';
import type { Player } from '~/types/Player';

const router = useRouter();
const route = useRoute();
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

onMounted(async () => {
  if (route.query.id) {
    selectedPlayer.value = playerStore.getPlayerByID(+route.query.id) as Player;
    showDialog.value = true;
  }
});
</script>

<template>
  <SkeletonPlayers v-if="!playerStore.isLoaded" />
  <div v-else>
    <PlayerModal
      v-model="showDialog"
      :selected-player="selectedPlayer"
    />
    <div
      v-for="(data, index) in playerData"
      :key="index"
    >
      <h1 class="main-heading">
        {{ data.position }}
      </h1>
      <div class="mb-4 flex justify-between rounded-sm">
        <div class="w-full border-r border-gray-100">
          <div class="grid grid-cols-1 gap-1 md:grid-cols-2">
            <div
              v-for="player in data.players"
              :key="player.player_id"
              class="relative flex w-full cursor-pointer flex-col items-center justify-around border-b border-gray-100 bg-white text-sm"
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
