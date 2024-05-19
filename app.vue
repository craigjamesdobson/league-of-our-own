<script setup>
import { usePlayerStore } from '@/stores/players';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';

const playerStore = usePlayerStore();
await playerStore.fetchPlayers();

const draftedTeamsStore = useDraftedTeamsStore();
await draftedTeamsStore.fetchDraftedTeams();
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
@import '@/assets/components/layout';
</style>
