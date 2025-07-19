<script setup>
import { usePlayerStore } from '@/stores/players';

const playerStore = usePlayerStore();
await playerStore.fetchPlayers();

const { initialize } = useHotjar();

initialize();
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <div id="modals" />
  </div>
</template>
