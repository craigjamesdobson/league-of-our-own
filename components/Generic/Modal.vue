<script setup>
const { toggleDialog, dialogVisible } = useDialog();

defineExpose({ toggleDialog });
</script>

<template>
  <div>
    <div
      class="modal flex items-center justify-center"
      :class="{ '-active': dialogVisible }"
      @click.self="toggleDialog(false)"
    >
      <div class="bg-white p-5">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/components/modal';
</style>
