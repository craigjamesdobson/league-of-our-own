<script setup>
import { useModal } from '@/composables/useModal';

const { toggleModal, modalVisible } = useModal();

defineExpose({ toggleModal });
</script>

<template>
  <div>
    <div
      class="flex items-center justify-center modal"
      :class="{ '-active': modalVisible }"
      @click.self="toggleModal(false)"
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
