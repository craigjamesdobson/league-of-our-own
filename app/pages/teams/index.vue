<script setup lang="ts">
import { useDraftedTeamsStore } from '@/stores/draftedTeams';

const draftedTeamsStore = useDraftedTeamsStore();
const user = useSupabaseUser();

draftedTeamsStore.clearDraftedTeamAdminMetadata();

await Promise.all([
  draftedTeamsStore.fetchDraftedTeams(),
  user.value
    ? draftedTeamsStore.fetchDraftedTeamAdminMetadata()
    : Promise.resolve(),
]);
</script>

<template>
  <div v-if="draftedTeamsStore.getDraftedTeams">
    <div class="grid lg:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="draftedTeam in draftedTeamsStore.getDraftedTeams"
        :key="draftedTeam.drafted_team_id"
        class="m-2"
      >
        <DraftedTeam
          v-if="draftedTeam"
          :drafted-team="draftedTeam"
          :admin-metadata="user
            ? draftedTeamsStore.getDraftedTeamAdminMetadataByID(draftedTeam.drafted_team_id)
            : undefined"
        />
      </div>
    </div>
  </div>
  <div v-else>
    <div class="grid lg:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="i in 12"
        :key="i"
        class="m-2"
      >
        <SkeletonDraftedTeam />
      </div>
    </div>
  </div>
</template>
