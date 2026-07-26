<script setup lang="ts">
const {
  draftedTeamData,
  draftedTeamPlayers,
  turnstileToken,
  selectedPlayerIds,
  isExistingDraftedTeam,
  remainingBudget,
  isOverBudget,
  loading,
  submitTeam,
  fetchDraftedTeamData,
  setTeamPlayers,
} = useTeamBuilder();

const route = useRoute();
const config = useRuntimeConfig();
const registrationOpen = computed(() => config.public.TEAM_REGISTRATION_OPEN);

if (registrationOpen.value && route.query.id) {
  await fetchDraftedTeamData();
}
else if (registrationOpen.value) {
  setTeamPlayers([
    { position: 1, count: 1 },
    { position: 2, count: 4 },
    { position: 3, count: 3 },
    { position: 4, count: 3 },
  ]);
}
</script>

<template>
  <div
    v-if="!registrationOpen"
    class="flex min-h-full items-center justify-center"
  >
    <Message :closable="false">
      Team entries are currently closed.
    </Message>
  </div>
  <div
    v-else
    class="flex flex-col-reverse gap-5 2xl:flex-row"
  >
    <Toast position="top-right" />
    <div class="px-5 2xl:w-96">
      <h1 class="mb-2.5 text-center text-xl font-black uppercase 2xl:text-left">
        Team details
      </h1>
      <TeamBuilderForm
        v-model:drafted-team-data="draftedTeamData"
        v-model:turnstile-token="turnstileToken"
        :is-existing-drafted-team="isExistingDraftedTeam"
        :remaining-budget="remainingBudget"
        :is-over-budget="isOverBudget"
        :loading="loading"
        :submit-team="submitTeam"
      />
    </div>

    <div class="flex flex-1 flex-col">
      <h2 class="mb-2.5 text-center text-xl font-black uppercase">
        Pick your team
      </h2>
      <div class="text-center 2xl:hidden">
        <Message
          v-if="isExistingDraftedTeam"
          severity="info"
          :closable="false"
        >
          You are editing your existing team.
        </Message>
        <div
          v-else
          class="text-xs"
        >
          <Divider />
          <p class="mb-5">
            Pick your eleven players, complete your details, and submit your team.
          </p>
          <Divider />
        </div>
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
