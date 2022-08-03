<template>
  <div>
    <h1>Account</h1>
    <textarea
      name="player-data"
      id=""
      cols="50"
      rows="10"
      placeholder="Paste player data here..."
      v-model="playerData"
    >
    </textarea>
    <button
      :class="{ 'pointer-events-none opacity-25': loading }"
      class="flex bg-primary text-white p-2"
      @click="updatePlayerData"
    >
      Update Players
    </button>
    <div class="update-log"></div>
  </div>
</template>

<script setup>
import { usePlayersStore } from '~/stores/players';
const playerStore = usePlayersStore();
const playerData = ref('');

const loading = ref(false);

const updatePlayerData = async () => {
  loading.value = true;
  await playerStore.updatePlayerData(playerData.value);
  playerData.value = '';
  loading.value = false;
};
</script>

<style lang="scss" scoped></style>
