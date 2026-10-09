<script setup lang="ts">
const { settings, transferTargetGameweek } = useAppSettings();
</script>

<template>
  <p
    role="status"
    aria-live="polite"
    class="flex items-start gap-2 text-base leading-7 text-toned dark:text-slate-300"
  >
    <UIcon
      name="i-lucide-calendar-days"
      class="mt-1 size-5 shrink-0 text-primary dark:text-primary-300"
      aria-hidden="true"
    />
    <span v-if="transferTargetGameweek !== null">
      Requests received before the weekly deadline are for
      <strong class="font-semibold text-highlighted">Gameweek {{ transferTargetGameweek }}</strong>,
      if approved.
    </span>
    <span v-else-if="settings">
      Transfer requests are closed for this season.
    </span>
    <span v-else>
      We cannot confirm the transfer gameweek. Please refresh this page before sending a request.
    </span>
  </p>
</template>
