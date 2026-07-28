<script setup lang="ts">
import { PlayerPosition } from '~/types/PlayerPosition';

const {
  draftedTeamData,
  draftedTeamPlayers,
  turnstileToken,
  selectedPlayerIds,
  isExistingDraftedTeam,
  saveConfirmation,
  remainingBudget,
  teamBudget,
  teamValue,
  isOverBudget,
  loading,
  submitTeam,
  fetchDraftedTeamData,
  setTeamPlayers,
} = useTeamBuilder();

const route = useRoute();
const {
  teamRegistrationOpen: registrationOpen,
  teamSubmissionDeadline,
} = useAppSettings();

const selectedCount = computed(() => selectedPlayerIds.value.length);
const positionCounts = computed(() => {
  const counts = new Map<PlayerPosition, number>();
  for (const player of draftedTeamPlayers.value) {
    if (player.selectedPlayer) {
      counts.set(player.position, (counts.get(player.position) ?? 0) + 1);
    }
  }
  return counts;
});

const positionProgress = computed(() => [
  { label: 'GK', selected: positionCounts.value.get(PlayerPosition.GOALKEEPER) ?? 0, total: 1 },
  { label: 'DEF', selected: positionCounts.value.get(PlayerPosition.DEFENDER) ?? 0, total: 4 },
  { label: 'MID', selected: positionCounts.value.get(PlayerPosition.MIDFIELDER) ?? 0, total: 3 },
  { label: 'FWD', selected: positionCounts.value.get(PlayerPosition.FORWARD) ?? 0, total: 3 },
]);

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
    <UAlert
      color="info"
      variant="soft"
      class="max-w-xl"
    >
      <template #description>
        Team entries are currently closed.
      </template>
    </UAlert>
  </div>
  <div
    v-else
    class="flex flex-col gap-5"
  >
    <UAlert
      v-if="saveConfirmation"
      color="success"
      variant="soft"
      class="mx-5"
      icon="i-lucide-check-circle-2"
    >
      <template #description>
        <strong>{{ saveConfirmation === 'updated' ? 'Team updated' : 'Team submitted' }}</strong>
        <span class="block text-sm">
          {{ saveConfirmation === 'updated'
            ? 'Your changes have been saved. No new email was sent.'
            : 'Your team has been saved successfully. A confirmation email has been sent.' }}
        </span>
      </template>
    </UAlert>
    <div class="flex flex-col-reverse gap-5 2xl:flex-row">
      <div
        id="team-details"
        class="scroll-mt-20 px-5 2xl:w-96"
      >
        <h1 class="mb-2.5 text-center text-xl font-black uppercase 2xl:text-left">
          Team details
        </h1>
        <TeamBuilderForm
          v-model:drafted-team-data="draftedTeamData"
          v-model:turnstile-token="turnstileToken"
          :is-existing-drafted-team="isExistingDraftedTeam"
          :remaining-budget="remainingBudget"
          :team-budget="teamBudget"
          :team-value="teamValue"
          :team-submission-deadline="teamSubmissionDeadline"
          :is-over-budget="isOverBudget"
          :loading="loading"
          :submit-team="submitTeam"
        />
      </div>

      <div class="flex flex-1 flex-col">
        <h2 class="mb-2.5 text-center text-xl font-black uppercase">
          Pick your team
        </h2>
        <div class="sticky top-0 z-10 mb-5 flex flex-col items-center gap-2.5 border-b border-slate-200 bg-white/95 px-3 py-3 text-sm backdrop-blur 2xl:static 2xl:border-0 2xl:bg-transparent 2xl:p-0 2xl:backdrop-blur-none dark:border-slate-700 dark:bg-slate-950/95">
          <p class="font-bold">
            {{ selectedCount }} / 11 players selected
          </p>
          <div class="flex flex-wrap justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span
              v-for="progress in positionProgress"
              :key="progress.label"
              class="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800"
            >
              {{ progress.label }} {{ progress.selected }}/{{ progress.total }}
            </span>
          </div>
          <div class="grid w-full max-w-sm grid-cols-3 gap-2 text-center text-xs 2xl:hidden">
            <div>
              <p class="text-slate-500 dark:text-slate-400">
                Value
              </p>
              <p class="font-bold text-slate-900 dark:text-slate-100">
                £{{ teamValue.toFixed(1) }}m
              </p>
            </div>
            <div>
              <p class="text-slate-500 dark:text-slate-400">
                Budget
              </p>
              <p class="font-bold text-slate-900 dark:text-slate-100">
                £{{ teamBudget.toFixed(1) }}m
              </p>
            </div>
            <div>
              <p class="text-slate-500 dark:text-slate-400">
                Remaining
              </p>
              <p :class="isOverBudget ? 'font-bold text-red-600 dark:text-red-300' : 'font-bold text-emerald-600 dark:text-emerald-300'">
                £{{ remainingBudget.toFixed(1) }}m
              </p>
            </div>
          </div>
          <a
            href="#team-details"
            class="text-xs font-bold text-blue-600 underline underline-offset-2 dark:text-blue-300 2xl:hidden"
          >
            Team details &amp; submit
          </a>
        </div>
        <div class="text-center 2xl:hidden">
          <UAlert
            v-if="isExistingDraftedTeam"
            color="info"
            variant="soft"
          >
            <template #description>
              You are editing your existing team. It was last edited on <strong>{{
                draftedTeamData.updated_at
                  ? new Date(draftedTeamData.updated_at).toLocaleDateString('en-GB')
                  : draftedTeamData.created_at
                    ? new Date(draftedTeamData.created_at).toLocaleDateString('en-GB')
                    : 'Unknown'
              }}</strong>. Changes are saved without sending another email.
            </template>
          </UAlert>
          <div
            v-else
            class="text-xs"
          >
            <div class="my-5 h-px w-full bg-slate-200 dark:bg-slate-700" />
            <p class="mb-5">
              Pick your eleven players, complete your details, and submit your team.
            </p>
            <div class="my-5 h-px w-full bg-slate-200 dark:bg-slate-700" />
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
    </div>
  </div>
</template>
