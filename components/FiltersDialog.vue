<template>
  <Dialog
    v-model:visible="modelValue"
    :dismissable-mask="true"
    modal
    header="FILTERS"
    class="m-5"
  >
    <Filters />
    <Button
      class="w-full"
      label="Apply"
      @click="modelValue = false"
    />
  </Dialog>
</template>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const modelValue = defineModel<boolean>();
</script>

<style scoped></style>
