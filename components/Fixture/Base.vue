<template>
  <div v-if="fixture" class="my-5 flex items-center justify-center gap-40">
    <div class="flex flex-col items-center gap-5">
      <img
        class="h-w-16 aspect-square w-16"
        :src="getImageUrl(fixture.home_team.short_name.toLowerCase())"
      />
      <p class="text-lg font-black uppercase">{{ fixture.home_team.name }}</p>
      <span class="text-lg font-bold">{{
        fixture.home_team_score ?? '-'
      }}</span>
    </div>
    <div>VS</div>
    <div class="flex flex-col items-center gap-5">
      <img
        class="h-w-16 aspect-square w-16"
        :src="getImageUrl(fixture.away_team.short_name.toLowerCase())"
      />
      <p class="text-lg font-black uppercase">{{ fixture.away_team.name }}</p>
      <span class="text-lg font-bold">{{
        fixture.away_team_score ?? '-'
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Fixture } from '~/types/Fixture';

const fixture = defineModel<Fixture>('fixture');
</script>

<style scoped></style>
