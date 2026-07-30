<template>
  <article class="rounded-2xl border border-default bg-elevated p-5 text-muted sm:p-6">
    <h3 class="mb-3 flex items-center gap-3 font-black uppercase tracking-wide text-default">
      <Icon
        v-if="icon"
        :name="icon"
        class="size-5 text-primary"
        aria-hidden="true"
      />
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
  icon?: string;
}>();
</script>
