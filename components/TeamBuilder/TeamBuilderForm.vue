<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { email, helpers, required } from '@vuelidate/validators';
import { useToast } from 'primevue/usetoast';
import type { TablesInsert } from '~/types/database.types';

const toast = useToast();

// Use defineModel for two-way binding
const draftedTeamData = defineModel<TablesInsert<'drafted_teams'>>('draftedTeamData', {
  required: true,
});

// Accept other props from parent component
const props = defineProps<{
  isExistingDraftedTeam: boolean;
  remainingBudget: number;
  isOverBudget: boolean;
  loading: { submittingForm: boolean };
  submitTeam: () => Promise<void>;
}>();

// Use props instead of composable
const { isExistingDraftedTeam } = toRefs(props);

const rules = computed(() => {
  return {
    team_name: {
      required: helpers.withMessage('The team name field is required', required),
    },
    team_owner: {
      required: helpers.withMessage(
        'The team owner field is required',
        required,
      ),
    },
    team_email: {
      required: helpers.withMessage('The email field is required', required),
      email: helpers.withMessage('Invalid email format', email),
    },
    contact_number: {
      number: helpers.withMessage('Invalid phone number', helpers.regex(/^(07\d{8,9})$/)),
    },
  };
});

// Create a reactive object for validation that only includes the fields we validate
const validationData = computed(() => ({
  team_name: draftedTeamData.value.team_name,
  team_owner: draftedTeamData.value.team_owner,
  team_email: draftedTeamData.value.team_email,
  contact_number: draftedTeamData.value.contact_number,
}));

const v$ = useVuelidate(rules, validationData);

const contactNumber = computed({
  get: () => draftedTeamData.value.contact_number || '',
  set: (value: string) => {
    draftedTeamData.value.contact_number = value.trim() || null;
  },
});

const handleTeamSubmit = async () => {
  // Validate form fields first
  if (v$.value.$invalid) {
    v$.value.$touch();

    toast.add({
      severity: 'error',
      summary: 'Form errors',
      detail: 'Team details are incorrect, please review validation errors',
      life: 3000,
    });
    return;
  }

  // Use the composable's submit function (which handles team/player validation)
  await props.submitTeam();
};
</script>

<template>
  <div class="hidden 2xl:flex flex-col">
    <Message
      v-if="isExistingDraftedTeam"
      severity="info"
      :closable="false"
      size="small"
      class="mb-5"
    >
      You are editing your existing team. <br>It was last edited on <strong>{{
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
        Pick your team, fill in the form below, and then submit your team.
      </p>
      <p>
        Once you submit your team, you will receive an email confirming your selection and a link to edit
        your team if you wish.
      </p>
      <Divider />
    </div>
    <p class="font-bold text-xs mb-5">
      If you do not receive an email when submitting or editing, your team submission has
      failed. Please email us with as much detail as possible: <a
        class="underline font-bold"
        href="mailto:leagueofourown.fpl@gmail.com"
      >leagueofourown.fpl@gmail.com</a>.
    </p>
  </div>
  <div
    class="flex flex-col items-center gap-1 rounded-md bg-orange-100/70 border  text-orange-700 border-orange-200 p-2.5 mb-5"
  >
    <p>Deadline for submissions is</p>
    <p class="uppercase font-black">
      Wed 13th Aug 2025
    </p>
  </div>
  <form
    v-if="draftedTeamData"
    :key="draftedTeamData.key || 'new-team'"
    class="flex flex-col items-start gap-5"
  >
    <div class="flex w-full flex-col gap-1">
      <label
        class="font-bold uppercase"
        for="team_name"
      >Team name</label>
      <CommonFormField
        v-model="draftedTeamData.team_name"
        :validation="v$.team_name"
        type="text"
      />
    </div>
    <div class="flex w-full flex-col gap-1">
      <label
        class="font-bold uppercase"
        for="team_owner"
      >Team owner</label>
      <CommonFormField
        v-model="draftedTeamData.team_owner"
        :validation="v$.team_owner"
        type="text"
      />
    </div>
    <div class="flex w-full flex-col gap-1">
      <label
        class="font-bold uppercase"
        for="team_email"
      >Team email</label>
      <CommonFormField
        v-model="draftedTeamData.team_email"
        :validation="v$.team_email"
        type="email"
      />
    </div>
    <div class="flex w-full flex-col gap-1">
      <label
        class="font-bold uppercase"
        for="contact_number"
      >Contact number</label>
      <CommonFormField
        v-model="contactNumber"
        :validation="v$.contact_number"
        type="text"
      />
      <div
        v-if="draftedTeamData.contact_number"
        class="flex items-center gap-5 mt-2.5"
      >
        <Checkbox
          v-model="draftedTeamData.allow_communication"
          input-id="allow_communication"
          :binary="true"
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
        <Checkbox
          v-model="draftedTeamData.allowed_transfers"
          input-id="allowed_transfers"
          :binary="true"
        />
        <label
          for="allowed_transfers"
          class="font-bold uppercase"
        >Transfers allowed</label>
      </div>
    </div>
    <Message
      :severity="props.isOverBudget ? 'error' : 'success'"
      class="w-full !my-0"
      :closable="false"
    >
      <template #icon>
        <Icon
          class="mr-2.5 self-start"
          size="22"
          name="tabler:pig-money"
        />
      </template>
      <div class="flex flex-col items-center gap-2.5">
        <div class="flex items-center gap-2.5">
          Transfer Budget Remaining:
          <span class="text-lg font-black">{{
            props.remainingBudget.toFixed(1)
          }}</span>
        </div>
      </div>
    </Message>
    <Button
      :loading="props.loading.submittingForm"
      class="w-full"
      label="Submit team"
      @click="handleTeamSubmit"
    />
  </form>
</template>
