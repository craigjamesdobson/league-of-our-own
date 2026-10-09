<script setup lang="ts">
import { SUPPORT_EMAIL } from '~~/shared/utils/contact';

const props = withDefaults(defineProps<{
  title: string;
  showBackLink?: boolean;
}>(), {
  showBackLink: true,
});

const headingId = useId();
</script>

<template>
  <UCard
    class="mx-auto w-full min-w-0 max-w-4xl dark:ring-slate-700"
    :aria-labelledby="headingId"
  >
    <UButton
      v-if="props.showBackLink"
      to="/manage-team"
      variant="link"
      icon="i-lucide-arrow-left"
      label="Back to transfer options"
      size="lg"
      class="mb-5 min-h-12 px-0 text-sm dark:text-primary-300 dark:hover:text-primary-200"
    />
    <h1
      :id="headingId"
      class="text-2xl font-black uppercase tracking-wide text-highlighted sm:text-3xl"
    >
      {{ props.title }}
    </h1>
    <slot />
    <footer class="mt-6 border-t border-default pt-5 dark:border-slate-700">
      <p class="text-sm leading-6 text-muted dark:text-slate-300">
        Need help?
        <a
          :href="`mailto:${SUPPORT_EMAIL}`"
          class="break-words font-bold underline underline-offset-4"
        >{{ SUPPORT_EMAIL }}</a>
      </p>
    </footer>
  </UCard>
</template>
