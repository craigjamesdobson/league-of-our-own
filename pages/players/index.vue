<script setup></script>

<template lang="">
  <div class="mb-36 players-container xl:mb-0">
    <Players />
    <Filters />
  </div>
</template>

<style lang="scss">
.players-container {
  @apply grid gap-4 grid-cols-1;

  @media (min-width: 1280px) {
    grid-template-columns: 0.7fr 0.3fr;
  }
}
</style>
