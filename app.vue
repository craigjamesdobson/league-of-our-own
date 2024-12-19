<script setup>
import { usePlayerStore } from '@/stores/players';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';

const playerStore = usePlayerStore();
await playerStore.fetchPlayers();

const draftedTeamsStore = useDraftedTeamsStore();
await draftedTeamsStore.fetchDraftedTeams();

const { initialize } = useHotjar()

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
