<script setup lang="ts">
import { useDraftedTeamsStore } from '~~/stores/draftedTeams';
const draftedTeamsStore = useDraftedTeamsStore();
draftedTeamsStore.fetchDraftedTeams();
</script>

<template>
  <div>
    <h1 class="px-2 mb-2 text-3xl font-black tracking-widest uppercase">
      Teams
    </h1>
    <DraftedTeams />
  </div>
</template>

<style scoped></style>
