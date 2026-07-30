<template>
  <article class="rounded-2xl border border-default bg-elevated p-5 text-muted sm:p-6">
    <h3 class="mb-3 font-black uppercase tracking-wide text-default">
      {{ title }}
    </h3>
    <div class="space-y-2 leading-7">
      <slot />
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
