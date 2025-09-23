<script setup lang="ts">
import { getImageUrl } from '@/utils/images';
import type { Fixture } from '@/types/Fixture';

defineModel<Fixture | undefined>('fixture');
</script>

<template>
  <div
    v-if="fixture"
    class="flex items-center justify-evenly"
  >
    <div class="flex flex-col items-center gap-2.5">
      <img
        class="aspect-square w-10"
        :src="getImageUrl(fixture.home_team.short_name.toLowerCase())"
      >
      <p class="text-md font-black uppercase">
        {{ fixture.home_team.short_name }}
      </p>
      <span class="text-lg font-bold">{{
        fixture.home_team_score ?? '-'
      }}</span>
    </div>
    <div>VS</div>
    <div class="flex flex-col items-center gap-2.5">
      <img
        class="aspect-square w-10"
        :src="getImageUrl(fixture.away_team.short_name.toLowerCase())"
      >
      <p class="text-md font-black uppercase">
        {{ fixture.away_team.short_name }}
      </p>
      <span class="text-lg font-bold">{{
        fixture.away_team_score ?? '-'
      }}</span>
    </div>
  </div>
</template>
