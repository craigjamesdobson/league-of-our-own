<script setup lang="ts">
import { z } from 'zod';
import type { TablesInsert } from '~/types/database.types';

// Use defineModel for two-way binding
const draftedTeamData = defineModel<TablesInsert<'drafted_teams'>>('draftedTeamData', {
  required: true,
});

// Accept other props from parent component
const props = defineProps<{
  isExistingDraftedTeam: boolean;
  remainingBudget: number;
  teamBudget: number;
  teamValue: number;
  teamSubmissionDeadline: string;
  isOverBudget: boolean;
  loading: { submittingForm: boolean };
  submitTeam: () => Promise<void>;
}>();

// Use defineModel for turnstile token
const turnstileTokenModel = defineModel<string | null>('turnstileToken');

// Computed to handle null vs undefined for NuxtTurnstile
const turnstileToken = computed({
  get: () => turnstileTokenModel.value ?? undefined,
  set: (value: string | undefined) => {
    turnstileTokenModel.value = value ?? null;
  },
});

// Template ref for Turnstile widget
const turnstileRef = ref();

// Handle keepalive restoration for Turnstile widget
onActivated(() => {
  // Reset Turnstile widget when component is restored from cache
  nextTick(() => {
    turnstileRef.value?.reset();
  });
});

// Use props instead of composable
const { isExistingDraftedTeam } = toRefs(props);

const teamDetailsSchema = z.object({
  team_name: z.string().min(1, 'The team name field is required'),
  team_owner: z.string().min(1, 'The team owner field is required'),
  team_email: z.string().min(1, 'The email field is required').email('Invalid email format'),
  contact_number: z.preprocess(
    value => value ?? '',
    z.string().regex(/^(|07\d{9})$/, 'Invalid phone number'),
  ),
});

const contactNumber = computed({
  get: () => draftedTeamData.value.contact_number || '',
  set: (value: string) => {
    draftedTeamData.value.contact_number = value.trim() || null;
  },
});

const formattedDeadline = computed(() => {
  if (!props.teamSubmissionDeadline) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${props.teamSubmissionDeadline}T00:00:00Z`));
});

const handleTeamSubmit = async () => {
  // Use the composable's submit function (which handles team/player validation)
  try {
    await props.submitTeam();
  }
  finally {
    turnstileTokenModel.value = null;
    if (typeof turnstileRef.value?.reset === 'function') {
      turnstileRef.value.reset();
    }
  }
};
</script>

<template>
  <div class="hidden 2xl:flex flex-col">
    <UAlert
      v-if="isExistingDraftedTeam"
      color="info"
      variant="soft"
      class="mb-5"
    >
      <template #description>
        You are editing your existing team. It was last edited on <strong>{{
          draftedTeamData.updated_at
            ? new Date(draftedTeamData.updated_at).toLocaleDateString('en-GB')
            : draftedTeamData.created_at
              ? new Date(draftedTeamData.created_at).toLocaleDateString('en-GB')
              : 'Unknown'
        }}</strong>
      </template>
    </UAlert>
    <div
      v-else
      class="flex flex-col text-xs"
    >
      <USeparator class="mb-5" />
      <p class="mb-5">
        Pick your team, fill in the form below, and then submit your team.
      </p>
      <p>
        Once you submit your team, you will receive an email confirming your selection and a link to edit
        your team if you wish.
      </p>
      <USeparator class="my-5" />
    </div>
    <p class="font-bold text-xs mb-5">
      Your team may still be saved if the confirmation email is delayed or missing.
      Please contact us to check your submission: <a
        class="underline font-bold"
        href="mailto:leagueofourown.fpl@gmail.com"
      >leagueofourown.fpl@gmail.com</a>.
    </p>
  </div>
  <UAlert
    color="success"
    variant="soft"
    class="mb-5"
  >
    <template #description>
      <div class="flex flex-col items-center gap-1">
        <p class="uppercase font-black">
          Team entry is now open
        </p>
        <p>Submission deadline: {{ formattedDeadline }}</p>
      </div>
    </template>
  </UAlert>
  <UForm
    v-if="draftedTeamData"
    :key="draftedTeamData.key || 'new-team'"
    :schema="teamDetailsSchema"
    :state="draftedTeamData"
    class="flex flex-col items-start gap-5"
    @submit="handleTeamSubmit"
  >
    <UFormField
      class="w-full"
      label="Team name"
      name="team_name"
      required
    >
      <UInput
        v-model="draftedTeamData.team_name"
        class="w-full"
        type="text"
        autocomplete="organization"
      />
    </UFormField>
    <UFormField
      class="w-full"
      label="Team owner"
      name="team_owner"
      required
    >
      <UInput
        v-model="draftedTeamData.team_owner"
        class="w-full"
        type="text"
        autocomplete="name"
      />
    </UFormField>
    <UFormField
      class="w-full"
      label="Team email"
      name="team_email"
      required
    >
      <UInput
        v-model="draftedTeamData.team_email"
        class="w-full"
        type="email"
        autocomplete="email"
      />
    </UFormField>
    <UFormField
      class="w-full"
      label="Contact number"
      name="contact_number"
    >
      <UInput
        v-model="contactNumber"
        class="w-full"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
      />
    </UFormField>
    <div class="flex w-full flex-col gap-1">
      <div
        v-if="draftedTeamData.contact_number"
        class="flex items-center gap-5 mt-2.5"
      >
        <UCheckbox
          id="allow_communication"
          v-model="draftedTeamData.allow_communication"
        />
        <label
          for="allow_communication"
          class="text-xs"
        >If you would like to be added to a WhatsApp group for
          updates and general chat, please tick this box</label>
      </div>
    </div>
    <div class="flex w-full flex-col gap-1">
      <div class="flex items-center gap-5">
        <UCheckbox
          id="allowed_transfers"
          v-model="draftedTeamData.allowed_transfers"
        />
        <label
          for="allowed_transfers"
          class="font-bold uppercase"
        >Transfers allowed</label>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Teams with transfers have an £85.0m budget. Leave this unchecked for the standard £90.0m budget.
      </p>
    </div>
    <UAlert
      :color="props.isOverBudget ? 'error' : 'success'"
      variant="soft"
      class="w-full"
      icon="tabler:pig-money"
    >
      <template #description>
        <div class="flex flex-col items-center gap-2.5">
          <div class="grid w-full grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p>Squad value</p>
              <p class="text-lg font-black">
                £{{ props.teamValue.toFixed(1) }}m
              </p>
            </div>
            <div>
              <p>Budget</p>
              <p class="text-lg font-black">
                £{{ props.teamBudget.toFixed(1) }}m
              </p>
            </div>
            <div>
              <p>Remaining</p>
              <p class="text-lg font-black">
                £{{ props.remainingBudget.toFixed(1) }}m
              </p>
            </div>
          </div>
        </div>
      </template>
    </UAlert>
    <NuxtTurnstile
      ref="turnstileRef"
      v-model="turnstileToken"
      class="mx-auto"
    />
    <UButton
      :loading="props.loading.submittingForm"
      class="w-full justify-center"
      :label="isExistingDraftedTeam ? 'Save changes' : 'Submit team'"
      type="submit"
    />
  </UForm>
</template>
