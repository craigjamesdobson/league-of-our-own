<template>
  <div class="flex gap-40 my-5 justify-center items-center">
    <div class="flex flex-col gap-5 items-center">
      <img
        class="w-16 h-w-16 aspect-square"
        :src="getImageUrl(fixture.home_team.short_name.toLowerCase())"
      />
      <p class="uppercase font-black">{{ fixture.home_team.name }}</p>
    </div>
    <div>VS</div>
    <div class="flex flex-col gap-5 items-center">
      <img
        class="w-16 h-w-16 aspect-square"
        :src="getImageUrl(fixture.away_team.short_name.toLowerCase())"
      />
      <p class="uppercase font-black">{{ fixture.away_team.name }}</p>
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
  away_team: Team;
  away_players: PlayerWithStats[];
}

const { fixture } = defineProps<{
  fixture: Fixture;
}>();
</script>

<style scoped></style>
