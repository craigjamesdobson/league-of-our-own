<script setup>
import { usePlayerStore } from '@/stores/players';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';

const playerStore = usePlayerStore();

await useAsyncData('players', () => playerStore.fetchPlayers());

const draftedTeamsStore = useDraftedTeamsStore();
await useAsyncData('drafted_teams', () =>
  draftedTeamsStore.fetchDraftedTeams()
);
</script>

<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage keepalive />
    </NuxtLayout>
    <div id="modals" />
  </div>
</template>

<style lang="scss">
@import '@/assets/components/layout';
</style>
