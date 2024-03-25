<template>
  <div v-if="!!fixture" class="grid grid-cols-2 gap-5">
    <div>
      <div class="flex justify-center gap-5 items-center m-10">
        <img
          class="w-16 h-w-16 aspect-square"
          :src="getImageUrl(fixture.home_team.short_name.toLowerCase())"
        />
        <p class="uppercase font-black">{{ fixture?.home_team.name }}</p>
        <input
          v-model="fixture.home_team_score"
          class="p-1 border rounded w-16"
          type="number"
          min="0"
        />
      </div>
      <TeamInput :players="homePlayers" />
    </div>
    <div>
      <div class="flex justify-center gap-5 items-center m-10">
        <input
          v-model="fixture.away_team_score"
          class="p-1 border rounded w-16"
          type="number"
          min="0"
        />
        <p class="uppercase font-black">{{ fixture?.away_team.name }}</p>
        <img
          class="w-16 h-w-16 aspect-square"
          :src="getImageUrl(fixture.away_team.short_name.toLowerCase())"
        />
      </div>
      <TeamInput :players="awayPlayers" />
    </div>
    <Button @click="filterPopulatedPlayers">Click</Button>
  </div>
</template>

<script setup lang="ts">
import { useFixtureStore } from '~/stores/fixtures';
import type { Database } from '~/types/database.types';
import type { Fixture } from '~/types/Fixture';
import type { PlayerWithStats } from '~/types/Player';

const supabase = useSupabaseClient<Database>();

const route = useRoute();
const fixtureStore = useFixtureStore();

const fixture: Ref<Fixture | null> = ref(null);

fixture.value = await fixtureStore.fetchFixtureByID(+route.params.id);

const { data: homePlayers } = await supabase
  .rpc('get_player_stats_by_team_id', {
    team_id_param: fixture.value!.home_team.id,
  })
  .returns<PlayerWithStats[]>();

const { data: awayPlayers } = await supabase
  .rpc('get_player_stats_by_team_id', {
    team_id_param: fixture.value!.away_team.id,
  })
  .returns<PlayerWithStats[]>();

const filterPopulatedPlayers = () => {
  const populatedHomePlayers = homePlayers.filter((player) => {
    return (
      player.week_assists > 0 ||
      player.week_goals > 0 ||
      player.week_redcard ||
      player.week_cleansheet
    );
  });

  const populatedAwayPlayers = awayPlayers.filter((player) => {
    return (
      player.week_assists > 0 ||
      player.week_goals > 0 ||
      player.week_redcard ||
      player.week_cleansheet
    );
  });

  console.log([...populatedHomePlayers, ...populatedAwayPlayers]);
};
</script>

<style scoped></style>
