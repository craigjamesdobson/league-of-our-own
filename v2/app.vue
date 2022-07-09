<template>
  <div>
    <ul>
      <li v-for='player in playerStore.playerList'>
      {{ player.web_name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { usePlayersStore } from '~/stores/players'

const players = playerStore.playerList

onMounted(() => {
  playerStore.fetchPlayerData();

})
</script>