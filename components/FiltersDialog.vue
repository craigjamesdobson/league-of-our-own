<template>
  <Dialog
    v-model:visible="modelValue"
    :dismissable-mask="true"
    modal
    header="FILTERS"
  >
    <Filters v-once />
  </Dialog>
</template>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const modelValue = defineModel<boolean>();
</script>

<style scoped></style>
