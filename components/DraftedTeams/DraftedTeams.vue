<script setup>
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
const draftedTeamsStore = useDraftedTeamsStore();
</script>

<template>
  <div class="grid lg:grid-cols-2 xl:grid-cols-4">
    <div
      v-for="draftedTeam in draftedTeamsStore.getDraftedTeams"
      :key="draftedTeam.id"
    >
      <DraftedTeam :drafted-team="draftedTeam" />
    </div>
  </div>
</template>

<style scoped></style>
