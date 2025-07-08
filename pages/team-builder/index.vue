<template>
  <div class="flex flex-col-reverse gap-5 2xl:flex-row">
    <Toast position="top-center" />
    <div class="px-5 2xl:w-96">
      <h2 class="mb-2.5 text-xl font-black uppercase text-center 2xl:text-left">
        Team Details
      </h2>
      <TeamBuilderForm
        :drafted-team-data="draftedTeamData"
        :drafted-team-players="draftedTeamPlayers"
      />
    </div>
    <div class="flex flex-col">
      <h2 class="mb-2.5 text-xl text-center font-black uppercase">
        Pick a team
      </h2>
      <div class="2xl:hidden text-center">
        <Message
          v-if="isExistingDraftedTeam"
          severity="info"
          :closable="false"
        >
          You are editing your existing team. <br> It was last edited on <strong>{{
            draftedTeamData.updated_at
              ? new Date(draftedTeamData.updated_at).toLocaleDateString('en-GB')
              : draftedTeamData.created_at
                ? new Date(draftedTeamData.created_at).toLocaleDateString('en-GB')
                : 'Unknown'
          }}</strong>
        </Message>
        <div
          v-else
          class="flex flex-col text-xs"
        >
          <Divider />
          <p class="mb-5">
            Pick your team, fill in the form below and then submit your team.
          </p>
          <p class="mb-5">
            Once you submit your team you will recieve an email confirming your selection and a link to edit
            your team if you
            wish.
          </p>
          <Divider />
        </div>
        <p class="font-bold text-xs mb-5">
          If you do not receive an email when submitting or editing your team submission has
          failed so please email us with as much detail as possible - <a
            class="underline font-bold"
            href="mailto:leagueofourown.fpl@gmail.com"
          > leagueofourown.fpl@gmail.com</a>.
        </p>
      </div>
      <div class="grid grid-cols-12 justify-center gap-5">
        <PlayerSection
          v-for="(player, index) in draftedTeamPlayers"
          :key="index"
          v-model:player="player.selectedPlayer"
          :selected-players="selectedPlayerIds"
          :position="player.position"
        />
      </div>
    </div>
    <ScrollTop class="!bottom-40 !bg-primary" />
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type { DraftedTeam } from '~/types/DraftedTeam';
import type { DraftedTeamPlayer } from '~/types/DraftedTeamPlayer';
import { PlayerPosition } from '~/types/PlayerPosition';
import type { Database, TablesInsert } from '~/types/database.types';

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const toast = useToast();

const draftedTeamData: Ref<TablesInsert<'drafted_teams'>> = ref({
  active_season: '24-25',
  team_name: '',
  team_owner: '',
  team_email: '',
  contact_number: null,
  allow_communication: false,
  allowed_transfers: false,
  total_team_value: 0,
});

const isExistingDraftedTeam = computed(() => !!draftedTeamData.value.key);

const teamStructure = [
  { position: PlayerPosition.GOALKEEPER, count: 1 },
  { position: PlayerPosition.DEFENDER, count: 4 },
  { position: PlayerPosition.MIDFIELDER, count: 3 },
  { position: PlayerPosition.FORWARD, count: 3 },
];

const draftedTeamPlayers: Ref<DraftedTeamPlayer[]> = ref([]);

const fetchDraftedTeamData = async () => {
  if (!route.query.id || typeof route.query.id !== 'string') {
    toast.add({
      severity: 'error',
      summary: 'Invalid team ID',
      detail: 'No valid team ID provided',
      life: 3000,
    });
    setTeamPlayers(teamStructure);
    return;
  }

  const { data, error } = await supabase
    .from('drafted_teams')
    .select(
      ` *,
        players:drafted_players(
          drafted_player_id,
          drafted_team,
          ...players_view(*)
        )
      `,
    )
    .eq('key', route.query.id)
    .returns<DraftedTeam[]>()
    .single();

  if (error) {
    toast.add({
      severity: 'error',
      summary: 'No team found',
      detail: 'No team was found using that id',
      life: 3000,
    });
    setTeamPlayers(teamStructure);
    return;
  }

  Object.assign(draftedTeamData.value, data);
  setTeamPlayers(teamStructure, data.players);
};

const setTeamPlayers = (
  teamStructure: { position: number; count: number }[],
  players: DraftedPlayer[] | null = null,
) => {
  teamStructure.forEach(({ position, count }) => {
    const playersForPosition = players
      ? players.filter(player => player.data.position === position)
      : [];

    const playersToAdd = players
      ? playersForPosition.slice(0, count)
      : Array.from({ length: count }, () => null);

    draftedTeamPlayers.value.push(
      ...playersToAdd.map((draftedPlayer: DraftedPlayer | null): DraftedTeamPlayer => ({
        draftedPlayerID: draftedPlayer?.drafted_player_id ?? undefined,
        position,
        selectedPlayer: draftedPlayer?.data ?? null,
      })),
    );
  });
};

if (route.query.id) {
  fetchDraftedTeamData();
}
else {
  setTeamPlayers(teamStructure);
}

const selectedPlayerIds = computed(() => {
  return draftedTeamPlayers.value
    .filter(player => player.selectedPlayer !== null)
    .map(player => player.selectedPlayer!.player_id);
});
</script>
