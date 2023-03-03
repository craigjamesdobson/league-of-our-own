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
    >
      Update Players
    </button>
    <textarea
      name="team-data"
      id=""
      cols="50"
      rows="10"
      placeholder="Paste team data here..."
      v-model="teamData"
    >
    </textarea>
    <button
      :class="{ 'pointer-events-none opacity-25': loading }"
      class="flex bg-primary text-white p-2"
    >
      Update Teams
    </button>
    <div class="update-log"></div>
  </div>
</template>

<script setup>
import { usePlayersStore } from "~/stores/players";
const playerStore = usePlayersStore();
const playerData = ref("");
const teamData = ref("");

const loading = ref(false);

const updatePlayerData = async () => {
  loading.value = true;
  await playerStore.updatePlayerData(playerData.value);
  playerData.value = "";
  loading.value = false;
};

const updateTeamData = async () => {
  loading.value = true;
  await playerStore.updateTeamData(teamData.value);
  playerData.value = "";
  loading.value = false;
};
</script>

<style lang="scss" scoped></style>
