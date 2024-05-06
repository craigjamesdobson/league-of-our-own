<script setup lang="ts">
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
const draftedTeamsStore = useDraftedTeamsStore();
await draftedTeamsStore.fetchDraftedTeams();
</script>

<template>
  <div>
    <DraftedTeams v-if="draftedTeamsStore.getDraftedTeams" :drafted-teams="draftedTeamsStore.getDraftedTeams" />
  </div>
</template>

<style scoped></style>
