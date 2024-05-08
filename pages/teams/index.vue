<script setup lang="ts">
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
const draftedTeamsStore = useDraftedTeamsStore();
await draftedTeamsStore.fetchDraftedTeams();
</script>

<template>
  <div>
    <div v-if="draftedTeamsStore.getDraftedTeams">
      <h1 class="main-heading">Teams</h1>
      <div class="grid lg:grid-cols-2 xl:grid-cols-4">
        <div v-for="draftedTeam in draftedTeamsStore.getDraftedTeams" :key="draftedTeam.drafted_team_id" class="m-2">
          <DraftedTeam v-if="draftedTeam" :drafted-team="draftedTeam" />
        </div>
      </div>
    </div>
    <SkeletonDraftedTeams v-else />
  </div>
</template>

<style scoped></style>
