<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <div id="modals"></div>
  </div>
</template>

<script setup>
import { usePlayersStore } from '~/stores/players';

const playerStore = usePlayersStore();

await playerStore.getPlayerSettings();
</script>
