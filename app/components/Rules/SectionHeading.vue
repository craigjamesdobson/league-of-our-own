<template>
  <div class="mb-5 flex items-center gap-4">
    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-black text-primary">
      {{ number }}
    </span>
    <h2 class="text-2xl font-black uppercase tracking-tight sm:text-3xl">
      {{ title }}
    </h2>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: string;
  title: string;
}>();
</script>
