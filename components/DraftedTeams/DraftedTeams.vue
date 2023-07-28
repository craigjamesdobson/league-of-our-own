<script setup>
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
const draftedTeamsStore = useDraftedTeamsStore();
</script>

<template>
  <div
    v-if="draftedTeamsStore.getDraftedTeams.length"
    class="grid lg:grid-cols-2 xl:grid-cols-4"
  >
    <div
      v-for="draftedTeam in draftedTeamsStore.getDraftedTeams"
      :key="draftedTeam.id"
    >
      <DraftedTeam :drafted-team="draftedTeam" />
    </div>
  </div>
  <div v-else class="flex p-2 my-5">
    Teams will be visible at the start of the new season.
  </div>
</template>

<style scoped></style>
