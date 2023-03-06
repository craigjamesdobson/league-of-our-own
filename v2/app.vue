<script setup>
import { usePlayersStore } from '~/stores/players';

const playerStore = usePlayersStore();

await playerStore.getPlayerSettings();
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <div id="modals" />
  </div>
</template>

<style lang="scss">
@import "@/assets/components/layout";
</style>
