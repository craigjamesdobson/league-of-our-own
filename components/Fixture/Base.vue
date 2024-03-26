<template>
  <div class="flex gap-40 my-5 justify-center items-center">
    <div class="flex flex-col gap-5 items-center">
      <img
        class="w-16 h-w-16 aspect-square"
        :src="getImageUrl(fixture.home_team.short_name.toLowerCase())"
      />
      <p class="uppercase font-black text-lg">{{ fixture.home_team.name }}</p>
      <span class="font-bold">{{ fixture.home_team_score ?? '-' }}</span>
    </div>
    <div>VS</div>
    <div class="flex flex-col gap-5 items-center">
      <img
        class="w-16 h-w-16 aspect-square"
        :src="getImageUrl(fixture.away_team.short_name.toLowerCase())"
      />
      <p class="uppercase font-black text-lg">{{ fixture.away_team.name }}</p>
      <span class="font-bold">{{ fixture.away_team_score ?? '-' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerWithStats } from '~/types/Player';

interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface Fixture {
  id: number;
  home_team: Team;
  home_players: PlayerWithStats[];
  home_team_score: number;
  away_team: Team;
  away_players: PlayerWithStats[];
  away_team_score: number;
}

const fixture = defineModel<Fixture>('fixture');
</script>

<style scoped></style>
