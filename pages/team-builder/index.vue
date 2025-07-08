<template>
  <div class="flex flex-col-reverse gap-5 2xl:flex-row">
    <Toast position="top-center" />
    <div class="px-5 2xl:w-96">
      <h2 class="mb-2.5 text-xl font-black uppercase text-center 2xl:text-left">
        Team Details
      </h2>
      <TeamBuilderForm
        :drafted-team-data="draftedTeamData"
        :drafted-team-players="draftedTeamPlayers"
      />
    </div>
    <div class="flex flex-col">
      <h2 class="mb-2.5 text-xl text-center font-black uppercase">
        Pick a team
      </h2>
      <div class="2xl:hidden text-center">
        <Message
          v-if="isExistingDraftedTeam"
          severity="info"
          :closable="false"
        >
          You are editing your existing team. <br> It was last edited on <strong>{{
            draftedTeamData.updated_at
              ? new Date(draftedTeamData.updated_at).toLocaleDateString('en-GB')
              : draftedTeamData.created_at
                ? new Date(draftedTeamData.created_at).toLocaleDateString('en-GB')
                : 'Unknown'
          }}</strong>
        </Message>
        <div
          v-else
          class="flex flex-col text-xs"
        >
          <Divider />
          <p class="mb-5">
            Pick your team, fill in the form below and then submit your team.
          </p>
          <p class="mb-5">
            Once you submit your team you will recieve an email confirming your selection and a link to edit
            your team if you
            wish.
          </p>
          <Divider />
        </div>
        <p class="font-bold text-xs mb-5">
          If you do not receive an email when submitting or editing your team submission has
          failed so please email us with as much detail as possible - <a
            class="underline font-bold"
            href="mailto:leagueofourown.fpl@gmail.com"
          > leagueofourown.fpl@gmail.com</a>.
        </p>
      </div>
      <div class="grid grid-cols-12 justify-center gap-5">
        <PlayerSection
          v-for="(player, index) in draftedTeamPlayers"
          :key="index"
          v-model:player="player.selectedPlayer"
          :selected-players="selectedPlayerIds"
          :position="player.position"
        />
      </div>
    </div>
    <ScrollTop class="!bottom-40 !bg-primary" />
  </div>
</template>

<script setup lang="ts">
// Use the team builder composable
const {
  draftedTeamData,
  draftedTeamPlayers,
  selectedPlayerIds,
  isExistingDraftedTeam,
  fetchDraftedTeamData,
  setTeamPlayers,
} = useTeamBuilder();

// Handle initial data loading
const route = useRoute();

if (route.query.id) {
  fetchDraftedTeamData();
}
else {
  // Set up default team structure for new teams
  const teamStructure = [
    { position: 1, count: 1 }, // GOALKEEPER
    { position: 2, count: 4 }, // DEFENDER
    { position: 3, count: 3 }, // MIDFIELDER
    { position: 4, count: 3 }, // FORWARD
  ];
  setTeamPlayers(teamStructure);
}
</script>
