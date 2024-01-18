<template>
  <div class="players-container xl:mb-0">
    <div v-if="isSmallDevice" class="fixed top-5 right-5 z-10 opacity-75">
      <Button rounded aria-label="Player Filters" @click="visible = true">
        <Icon size="22" name="fluent:filter-32-filled" />
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
  @apply grid gap-4 grid-cols-1;

  @media (min-width: 1280px) {
    grid-template-columns: 0.7fr 0.3fr;
  }
}
</style>
