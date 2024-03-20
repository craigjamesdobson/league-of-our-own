<template>
  <div class="flex flex-col">
    <TeamInput :players="fixture.home_players" :team="fixture.home_team" />
  </div>
  <div>
    <TeamInput :players="fixture.away_players" :team="fixture.away_team" />
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
