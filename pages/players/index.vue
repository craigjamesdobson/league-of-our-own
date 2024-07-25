<template>
  <div class="players-container xl:mb-0">
    <div v-if="isSmallDevice" class="fixed right-5 top-5 z-10 opacity-75">
      <Button class="w-12 h-12 !p-2" rounded aria-label="Player Filters" @click="visible = true">
        <Icon size="24" name="fluent:filter-32-filled" />
      </Button>
    </div>
    <Players />
    <FiltersDialog v-if="isSmallDevice" v-model="visible" />
    <Filters v-else />
  </div>
</template>

<script setup lang="ts">
const isSmallDevice = window.matchMedia('(max-width: 1280px)').matches;
const visible = ref(false);
</script>

<style lang="scss">
.players-container {
  @apply grid grid-cols-1 gap-4;

  @media (min-width: 1280px) {
    grid-template-columns: 0.7fr 0.3fr;
  }
}
</style>
