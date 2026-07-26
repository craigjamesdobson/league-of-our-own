<template>
  <div class="overflow-hidden rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
    <div class="grid grid-cols-5 border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <div
        v-for="header in headers"
        :key="header"
        class="p-3"
      >
        {{ header }}
      </div>
    </div>
    <div
      v-for="row in 8"
      :key="row"
      class="grid grid-cols-5 border-b border-slate-100 last:border-b-0 dark:border-slate-800"
    >
      <div
        v-for="header in headers"
        :key="`${row}-${header}`"
        class="p-3"
      >
        <USkeleton class="h-5 w-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const headers = ['Player', 'Goals', 'Assists', 'Clean sheet', 'Red Card'];
</script>

<style scoped></style>
