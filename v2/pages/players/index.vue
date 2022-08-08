<template lang="">
  <div class="players-container">
    <Players></Players>
    <div>
      <Filters></Filters>
    </div>
  </div>
</template>
<script setup>
import { usePlayersStore } from '~/stores/players';
const playerStore = usePlayersStore();
</script>
<style lang="css">
.players-container {
  @apply grid gap-4;
  grid-template-columns: 0.75fr 0.25fr;
}
</style>
