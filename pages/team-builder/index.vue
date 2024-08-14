<template>
  <div class="h-full flex justify-center items-center">
    <Message :closable="false">Team entries are now closed. Teams will be available to view before the season begins</Message>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type { DraftedTeam } from '~/types/DraftedTeam';
import { PlayerPosition } from '~/types/PlayerPosition';
import type { Database, TablesInsert } from '~/types/database-generated.types';
import type { Player } from '~/types/Player';

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const toast = useToast();

const draftedTeamData: Ref<TablesInsert<'drafted_teams'>> = ref({
  team_name: '',
  team_owner: '',
  team_email: '',
  contact_number: null,
  allow_communication: false,
  allowed_transfers: false
});

const isExistingDraftedTeam = computed(() => !!draftedTeamData.value.key);

const teamStructure = [
  { position: PlayerPosition.GOALKEEPER, count: 1 },
  { position: PlayerPosition.DEFENDER, count: 4 },
  { position: PlayerPosition.MIDFIELDER, count: 3 },
  { position: PlayerPosition.FORWARD, count: 3 }
];

interface DraftedTeamPlayer {
  draftedPlayerID?: number;
  position: PlayerPosition;
  selectedPlayer: Player;
}

const draftedTeamPlayers: DraftedTeamPlayer[] = ref([]);

const fetchDraftedTeamData = async () => {
  const { data, error } = await supabase
    .from('drafted_teams')
    .select(
      ` *,
        players:drafted_players(
          drafted_player_id,
          drafted_team,
          ...players_view(*)
        )
      `
    )
    .eq('key', route.query.id)
    .returns<DraftedTeam[]>()
    .single();

  if (error) {
    toast.add({
      severity: 'error',
      summary: 'No team found',
      detail: 'No team was found using that id',
      life: 3000
    });
    setTeamPlayers(teamStructure);
    return;
  }

  Object.assign(draftedTeamData.value, data);
  // @ts-ignore - TODO: fix the typing for this...
  setTeamPlayers(teamStructure, data.players);
};

const setTeamPlayers = (
  teamStructure: { position: number; count: number }[],
  players: Player[] | null = null
) => {
  teamStructure.forEach(({ position, count }) => {
    const playersForPosition = players
      ? players.filter((player) => player.position === position)
      : [];

    const playersToAdd = players
      ? playersForPosition.slice(0, count)
      : Array.from({ length: count }, () => null);

    draftedTeamPlayers.value.push(
      // @ts-ignore -  This shouldnt be inherting the type never...
      ...playersToAdd.map((selectedPlayer: DraftedPlayer | null) => ({
        draftedPlayerID: selectedPlayer?.drafted_player_id ?? 0,
        position,
        selectedPlayer
      }))
    );
  });
};

if (route.query.id) {
  fetchDraftedTeamData();
} else {
  setTeamPlayers(teamStructure);
}

const selectedPlayerIds = computed(() => {
  return draftedTeamPlayers.value
    .filter((player) => player.selectedPlayer !== null)
    .map((player) => player.selectedPlayer?.player_id);
});
</script>

<style scoped></style>
