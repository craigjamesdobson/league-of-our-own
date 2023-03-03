<template>
  <div>
    <h1 class="text-3xl tracking-widest font-black uppercase px-2 mb-2">
      Teams
    </h1>
    <DraftedTeams></DraftedTeams>
  </div>
</template>

<script setup lang="ts">
import { useDraftedTeamsStore } from "~~/stores/draftedTeams";
const draftedTeamsStore = useDraftedTeamsStore();
draftedTeamsStore.fetchDraftedTeams();
</script>

<style scoped></style>
