<template>
  <div>
    <NuxtLayout>
      <Players></Players>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { usePlayersStore } from '~/stores/players'
import { Players } from './.nuxt/components';

const playerStore = usePlayersStore()

onMounted(() => {
  playerStore.fetchPlayerData();

})
</script>