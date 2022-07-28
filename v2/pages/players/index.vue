<template lang="">
  <div>
    <div>Players last update at: {{ playerStore.getPlayersUpdatedDate }}</div>
    <Players></Players>
  </div>
</template>
<script setup>
import { usePlayersStore } from '~/stores/players';
const playerStore = usePlayersStore();
</script>
<style lang=""></style>
