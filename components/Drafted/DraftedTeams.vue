<script setup>
import DraftedTeam from './DraftedTeam';
import { usePlayerStore } from '@/stores/players';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
const draftedTeamsStore = useDraftedTeamsStore();
const playerStore = usePlayerStore();
</script>

<template>
  <div v-if="playerStore.isLoaded">
    <h1 class="main-heading">Teams</h1>
    <div class="grid lg:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="draftedTeam in draftedTeamsStore.getDraftedTeams"
        :key="draftedTeam.drafted_team_id"
        class="m-2"
      >
        <DraftedTeam :drafted-team="draftedTeam" />
      </div>
    </div>
  </div>
  <SkeletonDraftedTeams v-else />
</template>

<style scoped></style>
