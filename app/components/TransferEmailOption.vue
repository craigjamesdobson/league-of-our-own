<script setup lang="ts">
import { TRANSFER_REQUEST_EMAIL } from '~~/shared/utils/contact';

const template = `Team name:
Manager name:
Manager email:

Transfer 1

OUT
Player ID:
Name:
Club:
Price:

IN
Player ID:
Name:
Club:
Price:

Transfer 2 - optional; delete if not needed

OUT
Player ID:
Name:
Club:
Price:

IN
Player ID:
Name:
Club:
Price:`;

const templateInput = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(null);
const copyMessage = ref('');

const copyTemplate = async () => {
  try {
    await navigator.clipboard.writeText(template);
    copyMessage.value = 'Template copied.';
  }
  catch {
    const input = templateInput.value?.textareaRef;
    input?.focus();
    input?.select();
    copyMessage.value = 'Automatic copying is unavailable. Copy the selected text using your device’s copy command.';
  }
};
</script>

<template>
  <UCard
    class="flex min-w-0 flex-col dark:divide-slate-700 dark:ring-slate-700"
    :ui="{ body: 'flex-1', footer: 'flex min-h-20 items-center' }"
  >
    <template #header>
      <div>
        <p class="text-xs font-black uppercase tracking-[0.2em] text-primary dark:text-primary-300">
          Option 2
        </p>
        <h2 class="mt-1 text-2xl font-black uppercase text-highlighted">
          Request by email
        </h2>
      </div>
    </template>
    <div class="flex flex-col gap-4">
      <p class="text-sm leading-6 text-muted dark:text-slate-300">
        Send your player choices directly from your own email using the template below. You do not need a private team link.
      </p>
      <p class="text-sm leading-6 text-muted dark:text-slate-300">
        Copy the template below, fill in your details, and send it to
        <span class="select-text font-bold text-highlighted">{{ TRANSFER_REQUEST_EMAIL }}</span>
        from the email address registered to your team. Use the subject
        <strong class="font-bold text-highlighted">Transfer request - [your team name]</strong>
        so we can identify your request.
        We will review your request manually.
      </p>
      <p class="text-sm leading-6 text-muted dark:text-slate-300">
        Please check the player IDs and prices, and make sure your transfers keep your team within its budget before emailing your request.
      </p>
      <p class="text-sm leading-6 text-muted dark:text-slate-300">
        Find player IDs, clubs and prices in the
        <NuxtLink
          to="/players"
          class="font-bold text-highlighted underline"
        >player list</NuxtLink>.
      </p>
      <UFormField label="Transfer template">
        <UTextarea
          ref="templateInput"
          :model-value="template"
          readonly
          :rows="14"
          class="w-full"
          :ui="{ base: 'resize-y font-mono dark:bg-slate-950/50 dark:ring-slate-600 dark:text-slate-200 dark:focus-visible:ring-primary-300' }"
        />
      </UFormField>
    </div>
    <template #footer>
      <div class="flex flex-wrap items-center gap-3">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          class="dark:ring-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          icon="i-lucide-copy"
          label="Copy template"
          @click="copyTemplate"
        />
        <p
          role="status"
          aria-live="polite"
          class="text-sm text-muted dark:text-slate-300"
        >
          {{ copyMessage }}
        </p>
      </div>
    </template>
  </UCard>
</template>
