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
        class="aspect-square w-10 object-contain"
        :src="getImageUrl(fixture.home_team.short_name.toLowerCase())"
      >
      <p class="text-md font-black uppercase text-slate-800 dark:text-slate-100">
        {{ fixture.home_team.short_name }}
      </p>
      <span class="text-lg font-bold text-slate-900 dark:text-slate-100">{{
        fixture.home_team_score ?? '-'
      }}</span>
    </div>
    <div class="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
      VS
    </div>
    <div class="flex flex-col items-center gap-2.5">
      <img
        class="aspect-square w-10 object-contain"
        :src="getImageUrl(fixture.away_team.short_name.toLowerCase())"
      >
      <p class="text-md font-black uppercase text-slate-800 dark:text-slate-100">
        {{ fixture.away_team.short_name }}
      </p>
      <span class="text-lg font-bold text-slate-900 dark:text-slate-100">{{
        fixture.away_team_score ?? '-'
      }}</span>
    </div>
  </div>
</template>
