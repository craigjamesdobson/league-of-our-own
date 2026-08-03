<script setup lang="ts">
import { PlayerPosition } from '~/types/PlayerPosition';
import { isTeamRegistrationOpen } from '~~/shared/utils/appSettings';
import { SUPPORT_EMAIL } from '~~/shared/utils/contact';

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

const deadlineCheckTime = ref(new Date());
let deadlineCheckInterval: ReturnType<typeof setInterval> | undefined;

const registrationIsOpen = computed(() => isTeamRegistrationOpen({
  teamRegistrationOpen: registrationOpen.value,
  teamSubmissionDeadline: teamSubmissionDeadline.value,
}, deadlineCheckTime.value));

const positionConfig = [
  {
    position: PlayerPosition.GOALKEEPER,
    label: 'Goalkeepers',
    anchor: 'position-goalkeepers',
  },
  {
    position: PlayerPosition.DEFENDER,
    label: 'Defenders',
    anchor: 'position-defenders',
  },
  {
    position: PlayerPosition.MIDFIELDER,
    label: 'Midfielders',
    anchor: 'position-midfielders',
  },
  {
    position: PlayerPosition.FORWARD,
    label: 'Forwards',
    anchor: 'position-forwards',
  },
] as const;

const selectedCount = computed(() => selectedPlayerIds.value.length);
const positionGroups = computed(() => positionConfig.map(group => ({
  ...group,
  players: draftedTeamPlayers.value.filter(player => player.position === group.position),
})));

const progressMessage = computed(() => {
  if (isOverBudget.value) {
    return `Over budget by £${Math.abs(remainingBudget.value).toFixed(1)}m`;
  }

  if (selectedCount.value < 11) {
    return `${11 - selectedCount.value} players still needed`;
  }

  return 'Squad complete — ready to submit';
});

const saveConfirmationAlert = computed(() => {
  switch (saveConfirmation.value) {
    case 'updated':
      return {
        color: 'success' as const,
        icon: 'i-lucide-check-circle-2',
        title: 'Team updated',
        description: 'Your changes have been saved. No new email was sent.',
      };
    case 'existing':
      return {
        color: 'info' as const,
        icon: 'i-lucide-info',
        title: 'Team already registered',
        description: `No duplicate was created. Please check your original confirmation email for the link to edit your team. If you cannot find it, email ${SUPPORT_EMAIL} for help.`,
      };
    case 'submitted-email-failed':
      return {
        color: 'warning' as const,
        icon: 'i-lucide-triangle-alert',
        title: 'Team saved',
        description: `Your team was saved, but the confirmation email could not be sent. Please contact ${SUPPORT_EMAIL}.`,
      };
    default:
      return {
        color: 'success' as const,
        icon: 'i-lucide-check-circle-2',
        title: 'Team submitted',
        description: 'Your team has been saved successfully. A confirmation email has been sent.',
      };
  }
});

onMounted(() => {
  deadlineCheckInterval = setInterval(() => {
    deadlineCheckTime.value = new Date();
  }, 60_000);
});

onBeforeUnmount(() => {
  if (deadlineCheckInterval) {
    clearInterval(deadlineCheckInterval);
  }
});

if (registrationIsOpen.value && route.query.id) {
  await fetchDraftedTeamData();
}
else if (registrationIsOpen.value) {
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
    v-if="!registrationIsOpen"
    class="flex min-h-full items-center justify-center"
  >
    <UAlert
      color="info"
      variant="soft"
      icon="i-lucide-lock-keyhole"
      class="max-w-xl"
    >
      <template #title>
        Team submissions closed
      </template>
      <template #description>
        Team submissions are now closed. Teams will be available before the season begins.
      </template>
    </UAlert>
  </div>
  <div
    v-else
    class="flex flex-col gap-5"
  >
    <UAlert
      v-if="saveConfirmation"
      :color="saveConfirmationAlert.color"
      variant="soft"
      class="w-full"
      :icon="saveConfirmationAlert.icon"
    >
      <template #description>
        <strong>{{ saveConfirmationAlert.title }}</strong>
        <span class="block text-sm">
          {{ saveConfirmationAlert.description }}
        </span>
      </template>
    </UAlert>
    <div class="flex flex-col-reverse gap-5 2xl:flex-row">
      <div
        id="team-details"
        class="scroll-mt-20 px-5 2xl:w-[28rem]"
      >
        <TeamBuilderForm
          v-model:drafted-team-data="draftedTeamData"
          v-model:turnstile-token="turnstileToken"
          :is-existing-drafted-team="isExistingDraftedTeam"
          :selected-count="selectedCount"
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
        <h2 class="mb-5 text-center text-xl font-black uppercase">
          Pick your team
        </h2>
        <div class="sticky top-16 z-10 -mx-5 mb-5 flex flex-col items-center gap-3 border-b border-slate-200 bg-white/95 px-5 py-4 text-sm backdrop-blur 2xl:static 2xl:mx-0 2xl:border-0 2xl:bg-transparent 2xl:px-5 2xl:py-4 2xl:backdrop-blur-none dark:border-slate-700 dark:bg-slate-950/95">
          <p class="font-bold">
            {{ selectedCount }} / 11 players selected
          </p>
          <div class="grid w-full max-w-sm grid-cols-3 gap-8 text-center text-sm">
            <div>
              <p class="text-slate-500 dark:text-slate-400">
                Squad value
              </p>
              <p class="text-2xl font-black leading-tight text-slate-900 dark:text-slate-100">
                £{{ teamValue.toFixed(1) }}m
              </p>
            </div>
            <div>
              <p class="text-slate-500 dark:text-slate-400">
                Budget
              </p>
              <p class="text-2xl font-black leading-tight text-slate-900 dark:text-slate-100">
                £{{ teamBudget.toFixed(1) }}m
              </p>
            </div>
            <div>
              <p class="text-slate-500 dark:text-slate-400">
                Remaining
              </p>
              <p :class="isOverBudget ? 'text-2xl font-black leading-tight text-red-600 dark:text-red-300' : 'text-2xl font-black leading-tight text-emerald-600 dark:text-emerald-300'">
                £{{ remainingBudget.toFixed(1) }}m
              </p>
            </div>
          </div>
          <p
            class="text-xs font-bold"
            :class="{
              'text-red-600 dark:text-red-300': isOverBudget,
              'text-emerald-600 dark:text-emerald-300': !isOverBudget && selectedCount === 11,
              'text-amber-600 dark:text-amber-300': !isOverBudget && selectedCount < 11,
            }"
            role="status"
            aria-live="polite"
          >
            {{ progressMessage }}
          </p>
          <a
            href="#team-details"
            class="text-xs font-bold text-blue-600 underline underline-offset-2 dark:text-blue-300 2xl:hidden"
          >
            Enter details &amp; submit
          </a>
        </div>
        <section class="mx-auto mb-5 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5 2xl:max-w-3xl">
          <div class="mb-4">
            <h3 class="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Choose your transfer option
            </h3>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
              This sets your budget and determines whether you can change players during the season.
            </p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="cursor-pointer">
              <input
                v-model="draftedTeamData.allowed_transfers"
                type="radio"
                name="transfer-option"
                :value="false"
                class="peer sr-only"
              >
              <span class="block rounded-xl border border-slate-200 p-4 transition peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary dark:border-slate-700 dark:peer-checked:bg-primary/10">
                <span class="flex items-center justify-between gap-3">
                  <span class="font-black text-slate-900 dark:text-slate-100">No transfers</span>
                  <span class="font-black text-slate-900 dark:text-slate-100">£90m</span>
                </span>
                <span class="mt-1 block text-xs text-slate-500 dark:text-slate-400">Your squad stays fixed all season.</span>
              </span>
            </label>
            <label class="cursor-pointer">
              <input
                v-model="draftedTeamData.allowed_transfers"
                type="radio"
                name="transfer-option"
                :value="true"
                class="peer sr-only"
              >
              <span class="block rounded-xl border border-slate-200 p-4 transition peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary dark:border-slate-700 dark:peer-checked:bg-primary/10">
                <span class="flex items-center justify-between gap-3">
                  <span class="font-black text-slate-900 dark:text-slate-100">Transfers allowed</span>
                  <span class="font-black text-slate-900 dark:text-slate-100">£85m</span>
                </span>
                <span class="mt-1 block text-xs text-slate-500 dark:text-slate-400">You can change players during the season.</span>
              </span>
            </label>
          </div>
        </section>
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
              Choose your transfer option above, then pick 11 players. Your progress and budget stay visible as you work.
            </p>
            <div class="my-5 h-px w-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div class="space-y-8">
          <section
            v-for="(group, groupIndex) in positionGroups"
            :id="group.anchor"
            :key="group.position"
            class="scroll-mt-36 rounded-2xl border border-slate-200/70 p-4 shadow-sm sm:p-5 dark:border-slate-700/70"
            :class="groupIndex % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900' : 'bg-white dark:bg-slate-800'"
            :aria-labelledby="`${group.anchor}-heading`"
          >
            <div class="mb-4 border-b border-slate-200 pb-3 dark:border-slate-700">
              <h3
                :id="`${group.anchor}-heading`"
                class="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-slate-100"
              >
                {{ group.label }}
              </h3>
            </div>
            <div class="grid grid-cols-12 justify-center gap-6">
              <PlayerSection
                v-for="(player, index) in group.players"
                :key="`${group.position}-${index}`"
                v-model:player="player.selectedPlayer"
                :selected-players="selectedPlayerIds"
                :position="player.position"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
