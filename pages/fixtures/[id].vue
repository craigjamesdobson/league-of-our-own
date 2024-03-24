<template>
  <div>
    <TeamInput :players="homePlayers" />
    <TeamInput :players="awayPlayers" />
  </div>
</template>

<script setup lang="ts">
import { useFixtureStore } from '~/stores/fixtures';
import type { Database } from '~/types/database-generated.types';

const supabase = useSupabaseClient<Database>();

const route = useRoute();
const fixtureStore = useFixtureStore();

const fixture = computed(() => fixtureStore.getFixtureByID(+route.params.id));

const { data: homePlayers } = await supabase.rpc(
  'get_player_stats_by_team_id',
  {
    team_id_param: fixture.value?.home_team.id,
  }
);

const { data: awayPlayers } = await supabase.rpc(
  'get_player_stats_by_team_id',
  {
    team_id_param: fixture.value?.away_team.id,
  }
);
</script>

<style scoped></style>
