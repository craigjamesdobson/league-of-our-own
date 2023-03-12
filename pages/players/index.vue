<script setup>
</script>

<template lang="">
  <div class="players-container">
    <Players />
    <div>
      <Filters />
    </div>
  </div>
</template>

<style lang="css">
.players-container {
  @apply grid gap-4;
  grid-template-columns: 0.75fr 0.25fr;
}
</style>
