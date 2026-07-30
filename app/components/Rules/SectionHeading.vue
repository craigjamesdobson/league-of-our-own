<template>
  <div class="mb-5 flex items-center gap-4">
    <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
      <Icon
        :name="icon"
        size="22"
        aria-hidden="true"
      />
    </span>
    <div>
      <p class="text-xs font-black uppercase tracking-[0.2em] text-muted">
        Section {{ number }}
      </p>
      <h2 class="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        {{ title }}
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: string;
  title: string;
  icon: string;
}>();
</script>
