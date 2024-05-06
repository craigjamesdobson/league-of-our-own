<script setup lang="ts">
import { usePlayerStore } from '@/stores/players';
import type { PropType } from 'vue';
import type { DraftedTeam } from '~/types/DraftedTeam';
const playerStore = usePlayerStore();

const props = defineProps({
  draftedTeams: {
    type: Array as PropType<DraftedTeam[]>,
    required: true,
  }
});

</script>

<template>
  <div v-if="playerStore.isLoaded">
    <h1 class="main-heading">Teams</h1>
    <div class="grid lg:grid-cols-2 xl:grid-cols-4">
      <div v-for="draftedTeam in props.draftedTeams" :key="draftedTeam.drafted_team_id" class="m-2">
        <DraftedTeam v-if="draftedTeam" :drafted-team="draftedTeam" />
      </div>
    </div>
  </div>
  <SkeletonDraftedTeams v-else />
</template>

<style scoped></style>
