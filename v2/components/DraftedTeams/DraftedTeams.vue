<template>
  <div class="grid grid-cols-4">
    <div v-for="draftedTeam in draftedTeamsStore.getDraftedTeams">
      <DraftedTeam :draftedTeam="draftedTeam"></DraftedTeam>
    </div>
  </div>
</template>

<script setup>
import { useDraftedTeamsStore } from "@/stores/draftedTeams";
const draftedTeamsStore = useDraftedTeamsStore();
</script>

<style scoped></style>
