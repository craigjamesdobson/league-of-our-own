<script setup lang="ts">
import TransferGameweekNotice from '~/components/TransferGameweekNotice.vue';
import TransferEntryLayout from '~/components/TransferEntryLayout.vue';

definePageMeta({
  middleware: ['online-transfers'],
});

const email = ref('');
const turnstileToken = ref<string | null>(null);
const turnstileRef = ref<{ reset: () => void } | null>(null);
const submitting = ref(false);
const submitted = ref(false);
const errorMessage = ref<string | null>(null);
const turnstileTokenValue = computed({
  get: () => turnstileToken.value ?? undefined,
  set: (value: string | undefined) => {
    turnstileToken.value = value ?? null;
  },
});

const requestManagementLink = async () => {
  if (submitting.value) return;

  if (!turnstileToken.value) {
    errorMessage.value = 'Please complete the security check and try again.';
    return;
  }

  try {
    submitting.value = true;
    errorMessage.value = null;
    await $fetch('/api/team-management-link', {
      method: 'POST',
      body: {
        email: email.value,
        turnstileToken: turnstileToken.value,
      },
    });
    submitted.value = true;
  }
  catch (error: unknown) {
    const statusMessage = error && typeof error === 'object' && 'statusMessage' in error
      ? error.statusMessage
      : undefined;
    errorMessage.value = typeof statusMessage === 'string'
      ? statusMessage
      : 'We could not process that request. Please try again.';
  }
  finally {
    submitting.value = false;
    turnstileToken.value = null;
    turnstileRef.value?.reset();
  }
};
</script>

<template>
  <TransferEntryLayout :title="submitted ? 'Check your inbox' : 'Get your team link'">
    <div
      v-if="submitted"
      role="status"
      aria-live="polite"
      class="mt-4 space-y-4 text-base leading-7 text-muted dark:text-slate-300"
    >
      <p>If a team that can make transfers is registered to that email address, we have sent its private team link.</p>
      <p>Open the link in the email to choose your players and send your transfer request.</p>
      <p>If the email does not arrive, check your spam folder or use the help address below.</p>
    </div>
    <template v-else>
      <p class="mt-3 max-w-[65ch] text-base leading-7 text-muted dark:text-slate-300">
        Enter the email address you used to register your team. We will send you a link to choose your transfers.
      </p>
      <TransferGameweekNotice class="mt-4" />
      <form
        class="mt-6 flex flex-col items-start gap-5"
        @submit.prevent="requestManagementLink"
      >
        <UFormField
          label="Your registered email address"
          class="w-full max-w-md"
          :ui="{ label: 'text-base font-semibold' }"
        >
          <UInput
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
            size="lg"
            class="w-full"
            :ui="{ base: 'min-h-12 text-base ring-slate-500 dark:bg-slate-950/50 dark:ring-slate-400 dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus-visible:ring-primary-300' }"
          />
        </UFormField>
        <NuxtTurnstile
          ref="turnstileRef"
          v-model="turnstileTokenValue"
          :options="{ size: 'compact' }"
        />
        <p
          v-if="errorMessage"
          role="alert"
          class="max-w-[65ch] text-base leading-7 text-error dark:text-red-300"
        >
          {{ errorMessage }}
        </p>
        <UButton
          type="submit"
          size="lg"
          :loading="submitting"
          :label="submitting ? 'Sending your link…' : 'Email my team link'"
          class="min-h-12 text-base dark:bg-primary-300 dark:text-slate-950 dark:hover:bg-primary-200"
        />
      </form>
      <p class="mt-5 max-w-[65ch] text-base leading-7 text-muted dark:text-slate-300">
        This sends your team link. Your team stays the same until you choose and submit transfers.
      </p>
    </template>
  </TransferEntryLayout>
</template>
