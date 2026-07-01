<template>
  <UModal
    v-model:open="modelValue"
    title="Filters"
    :dismissible="true"
    :ui="{
      overlay: 'bg-slate-950/75',
      content: 'm-5 bg-white text-slate-900 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700',
    }"
  >
    <template #body>
      <Filters />
      <UButton
        block
        label="Apply"
        @click="modelValue = false"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const modelValue = defineModel<boolean>();
</script>

<style scoped></style>
