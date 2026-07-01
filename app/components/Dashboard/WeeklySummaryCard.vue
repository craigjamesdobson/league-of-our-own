<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <UCard class="dashboard-card h-full">
    <template
      v-if="title"
      #header
    >
      <div class="flex items-center gap-2 text-slate-800 dark:text-slate-100">
        <Icon
          name="i-lucide-chart-line"
          class="text-primary"
        />
        <span class="font-bold text-lg">{{ title }}</span>
      </div>
    </template>

    <div
      v-if="isLoading"
      class="h-full"
    >
      <slot name="skeleton" />
    </div>
    <div
      v-else
      class="h-full flex flex-col"
    >
      <slot />
    </div>
  </UCard>
</template>

<style scoped>
@reference "@/assets/styles/base.css";

.dashboard-card {
  @apply flex flex-col border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none;
}
</style>
