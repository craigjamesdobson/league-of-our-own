<template>
  <div class="players-container xl:mb-0">
    <div
      v-if="isSmallDevice"
      class="fixed right-5 top-5 z-10 opacity-75"
    >
      <UButton
        class="h-12 w-12 rounded-full"
        icon="fluent:filter-32-filled"
        aria-label="Player Filters"
        square
        @click="visible = true"
      />
    </div>
    <Players />
    <FiltersDialog
      v-if="isSmallDevice"
      v-model="visible"
    />
    <Filters v-else />
  </div>
</template>

<script setup lang="ts">
const isSmallDevice = ref(false);

onMounted(() => {
  isSmallDevice.value = window.matchMedia('(max-width: 1280px)').matches;
});

const visible = ref(false);
</script>

<style>
@reference "@/assets/styles/base.css";

.players-container {
  @apply grid grid-cols-1 gap-4;

  @media (min-width: 1280px) {
    grid-template-columns: 0.7fr 0.3fr;
  }
}
</style>
