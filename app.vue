<script setup>
import { usePlayerStore } from '@/stores/players';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';

// const playerStore = usePlayerStore();
// await playerStore.fetchPlayers();

// const draftedTeamsStore = useDraftedTeamsStore();
// await draftedTeamsStore.fetchDraftedTeams();
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <div
    class="text-primary font-display flex h-full items-center justify-center"
  >
    <div class="flex flex-col rounded-sm bg-white p-10 text-center">
      <div
        class="bg-primary flex justify-items-center self-center rounded-full p-4"
      >
        <Icon class="text-slate-100" size="64" name="carbon:soccer" />
      </div>
      <h1
        class="border-primary mb-6 border-b text-4xl font-black uppercase tracking-wider md:text-[72px] md:leading-[72px]"
      >
        League of our own 24/25
      </h1>
      <span class="text-3xl tracking-widest text-neutral-800">Coming soon...</span>
    </div>
  </div>
  </div>
</template>

<style lang="scss">
@import '@/assets/components/layout';
</style>
