<script setup lang="ts">
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
import { sortTeamsWithFavourite } from '~/logic/favourite-team';

const draftedTeamsStore = useDraftedTeamsStore();
const user = useSupabaseUser();
const {
  favouriteTeamId: yourTeamId,
  isFavouriteTeam: isYourTeam,
  toggleFavouriteTeam: toggleYourTeam,
} = useFavouriteTeam();

const orderedDraftedTeams = computed(() => sortTeamsWithFavourite(
  draftedTeamsStore.getDraftedTeams ?? [],
  yourTeamId.value,
));

const hasSelectedYourTeam = computed(() => orderedDraftedTeams.value.some(
  team => team.drafted_team_id === yourTeamId.value,
));

const loadAdminMetadata = async (isAuthenticated: boolean) => {
  if (!isAuthenticated) {
    draftedTeamsStore.clearDraftedTeamAdminMetadata();
    return;
  }

  await draftedTeamsStore.fetchDraftedTeamAdminMetadata();
};

watch(user, currentUser => loadAdminMetadata(Boolean(currentUser)));

await Promise.all([
  draftedTeamsStore.fetchDraftedTeams(),
  loadAdminMetadata(Boolean(user.value)),
]);
</script>

<template>
  <div v-if="draftedTeamsStore.getDraftedTeams">
    <div
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      role="radiogroup"
      aria-label="Choose your team"
    >
      <DraftedTeam
        v-for="draftedTeam in orderedDraftedTeams"
        :key="draftedTeam.drafted_team_id"
        :is-your-team="isYourTeam(draftedTeam.drafted_team_id)"
        :show-your-team-control="!hasSelectedYourTeam || isYourTeam(draftedTeam.drafted_team_id)"
        :drafted-team="draftedTeam"
        :admin-metadata="user
          ? draftedTeamsStore.getDraftedTeamAdminMetadataByID(draftedTeam.drafted_team_id)
          : undefined"
        @toggle-your-team="toggleYourTeam(draftedTeam.drafted_team_id)"
      />
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
