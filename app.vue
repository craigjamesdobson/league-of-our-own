<script setup>
import { usePlayersStore } from '@/stores/players';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';

onMounted(async () => {
  const playerStore = usePlayersStore();
  await playerStore.getPlayerSettings();

  const draftedTeamsStore = useDraftedTeamsStore();
  await draftedTeamsStore.fetchDraftedTeams();
});
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
