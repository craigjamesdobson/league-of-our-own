<script lang="ts" setup>
const headers = ['Pos', 'Prv Pos.', 'Team', 'Goals', 'Assists', 'CS.', 'RC', 'Wk Pts.', 'Tot Pts.'];
</script>

<template>
  <div class="overflow-x-auto rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
    <div class="min-w-[900px]">
      <div class="grid grid-cols-[0.6fr_0.8fr_3fr_repeat(6,0.8fr)] border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <div
          v-for="header in headers"
          :key="header"
          class="p-3"
        >
          {{ header }}
        </div>
      </div>
      <div
        v-for="row in 20"
        :key="row"
        class="grid grid-cols-[0.6fr_0.8fr_3fr_repeat(6,0.8fr)] border-b border-slate-100 last:border-b-0 dark:border-slate-800"
      >
        <div
          v-for="header in headers"
          :key="`${row}-${header}`"
          class="p-3"
        >
          <USkeleton
            class="h-5"
            :class="header === 'Team' ? 'w-11/12' : 'w-8'"
          />
        </div>
      </div>
    </div>
  </div>
</template>
