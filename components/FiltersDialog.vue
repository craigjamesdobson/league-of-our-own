<template>
  <Dialog
    v-model:visible="modelValue"
    :dismissable-mask="true"
    modal
    header="FILTERS"
    class="m-5"
  >
    <Filters />
    <Button @click="modelValue = false" class="w-full"  label="Apply" />
  </Dialog>
</template>

<script setup lang="ts">
definePageMeta({
  keepalive: true
});

const modelValue = defineModel<boolean>();
</script>

<style scoped></style>
