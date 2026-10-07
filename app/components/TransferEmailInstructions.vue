<script setup lang="ts">
import TransferGameweekNotice from '~/components/TransferGameweekNotice.vue';
import TransferEntryLayout from '~/components/TransferEntryLayout.vue';
import { TRANSFER_REQUEST_EMAIL } from '~~/shared/utils/contact';

const props = withDefaults(defineProps<{ showBackLink?: boolean }>(), {
  showBackLink: false,
});

const { transferTargetGameweek } = useAppSettings();

const template = computed(() => `Team name:
Manager name:
Manager email:
${transferTargetGameweek.value === null ? '' : `Gameweek: ${transferTargetGameweek.value}\n`}
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
Price:`);

const templateInput = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(null);
const copyMessage = ref('');
const copyFeedbackId = useId();

const copyTemplate = async () => {
  try {
    await navigator.clipboard.writeText(template.value);
    copyMessage.value = 'Template copied. Paste it into a new email, then fill in your details.';
  }
  catch {
    const input = templateInput.value?.textareaRef;
    input?.focus();
    input?.select();
    copyMessage.value = 'Automatic copying is unavailable. Copy the selected template using your device’s Copy command.';
  }
};
</script>

<template>
  <TransferEntryLayout
    title="Request transfers by email"
    :show-back-link="props.showBackLink"
  >
    <TransferGameweekNotice class="mt-4" />
    <p class="mt-3 text-base leading-7 text-muted dark:text-slate-300">
      The transfer deadline is 7pm on Friday (UK time).
    </p>
    <UButton
      to="/rules#transfers"
      variant="link"
      size="lg"
      trailing
      icon="i-lucide-arrow-right"
      label="View transfer rules"
      class="mt-1 min-h-11 px-0 text-base dark:text-primary-300 dark:hover:text-primary-200"
    />
    <dl class="mt-5 space-y-3 text-base leading-7">
      <div>
        <dt class="font-semibold text-highlighted">
          Send to
        </dt>
        <dd class="break-words text-muted dark:text-slate-300">
          {{ TRANSFER_REQUEST_EMAIL }}
        </dd>
      </div>
      <div>
        <dt class="font-semibold text-highlighted">
          Subject
        </dt>
        <dd class="text-muted dark:text-slate-300">
          Transfer request - [your team name]
        </dd>
      </div>
    </dl>
    <ol class="mt-6 list-decimal space-y-3 pl-6 text-base leading-7 text-muted dark:text-slate-300">
      <li>Copy the template below.</li>
      <li>Paste it into a new email and fill in your player details.</li>
      <li>Send it from the email address registered to your team.</li>
    </ol>
    <p class="mt-5 max-w-[65ch] text-base leading-7 text-muted dark:text-slate-300">
      Delete Transfer 2 if you only want one transfer. Please check the player IDs and prices, and make sure your transfers keep your team within its budget.
    </p>
    <UButton
      to="/players"
      variant="soft"
      size="lg"
      trailing
      icon="i-lucide-arrow-right"
      label="Find player IDs and prices"
      class="mt-3 min-h-12 text-base dark:bg-primary-300/15 dark:text-primary-200 dark:hover:bg-primary-300/25"
    />
    <UFormField
      label="Transfer template"
      class="mt-6"
      :ui="{
        label: 'text-base font-semibold',
        labelWrapper: 'flex flex-wrap items-center gap-x-3 gap-y-2',
        hint: 'ml-auto',
      }"
    >
      <template #hint>
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          size="sm"
          trailing
          icon="i-lucide-copy"
          label="Copy template"
          class="min-h-11 text-sm"
          @click="copyTemplate"
        />
      </template>
      <div
        :id="copyFeedbackId"
        role="status"
        aria-live="polite"
      >
        <UAlert
          v-if="copyMessage"
          color="info"
          variant="soft"
          icon="i-lucide-info"
          :description="copyMessage"
          class="mb-3"
        />
      </div>
      <UTextarea
        ref="templateInput"
        :model-value="template"
        :aria-describedby="copyMessage ? copyFeedbackId : undefined"
        readonly
        autoresize
        :rows="template.split('\n').length"
        class="w-full"
        :ui="{ base: 'resize-none font-mono text-base leading-7 ring-slate-500 dark:bg-slate-950/50 dark:ring-slate-400 dark:text-slate-200 dark:focus-visible:ring-primary-300' }"
      />
    </UFormField>
  </TransferEntryLayout>
</template>
