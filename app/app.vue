<script setup>
import { usePlayerStore } from '@/stores/players';

const playerStore = usePlayerStore();
await Promise.all([
  playerStore.fetchPlayers(),
  playerStore.fetchClubs(),
]);

const { initialize } = useHotjar();

initialize();
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage keepalive />
    </NuxtLayout>
    <div id="modals" />
  </UApp>
</template>
