<script setup>
import { monitorUserStatus } from './logic/account/auth';
import { usePlayersStore } from '@/stores/players';
// import { useDraftedTeamsStore } from '@/stores/draftedTeams';

onMounted(() => {
  const playerStore = usePlayersStore();
  playerStore.getPlayerSettings();

  // const draftedTeamsStore = useDraftedTeamsStore();
  // draftedTeamsStore.fetchDraftedTeams();

  monitorUserStatus();
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
