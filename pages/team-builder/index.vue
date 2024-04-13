<template>
  <div class="flex flex-col 2xl:flex-row gap-5">
    <Toast />
    <div class="p-5 2xl:w-96">
      <h1 class="text-xl font-black uppercase mb-5">Team Details</h1>
      <form class="flex flex-col gap-5 items-start">
        <div class="flex flex-col gap-1 w-full">
          <label class="uppercase font-bold" for="team_name">Team name</label>
          <GenericFormField
            v-model="draftedTeamData.team_name"
            :validation="v$.team_name"
            type="text"
          />
        </div>
        <div class="flex flex-col gap-1 w-full">
          <label class="uppercase font-bold" for="team_owner">Team owner</label>
          <GenericFormField
            v-model="draftedTeamData.team_owner"
            :validation="v$.team_owner"
            type="text"
          />
        </div>
        <div class="flex flex-col gap-1 w-full">
          <label class="uppercase font-bold" for="team_email">Team email</label>
          <GenericFormField
            v-model="draftedTeamData.team_email"
            :validation="v$.team_email"
            type="email"
          />
        </div>
        <div class="flex flex-col gap-1 w-full">
          <div class="flex items-center">
            <Checkbox
              v-model="draftedTeamData.allowed_transfers"
              input-id="allowed_transfers"
              :binary="true"
            />
            <label for="allowed_transfers" class="uppercase font-bold ml-2.5"
              >Transfers Allowed</label
            >
          </div>
        </div>
        <Message
          :severity="calculateRemainingBudget() < 0 ? 'error' : 'success'"
          class="w-full"
          :closable="false"
        >
          <template #messageicon>
            <Icon class="mr-2.5 self-start" size="22" name="tabler:pig-money" />
          </template>
          <div class="flex flex-col gap-2.5 items-center">
            <div class="flex gap-2.5 items-center">
              Transfer Budget Remaining:
              <span class="font-black text-lg">{{
                calculateRemainingBudget().toFixed(1)
              }}</span>
            </div>
          </div>
        </Message>
        <Button
          :loading="loading"
          class="w-full hidden xl:flex"
          label="Submit team"
          @click="handleTeamSubmit"
        />
      </form>
    </div>
    <div class="grid grid-cols-12 justify-center">
      <PlayerSection
        v-for="(player, index) in draftedTeamPlayers"
        :key="index"
        v-model:player="player.selectedPlayer"
        :selected-players="selectedPlayerIds"
        :position="player.position"
      />
    </div>
    <Button
      class="w-full xl:hidden"
      :loading="loading"
      label="Submit team"
      @click="handleTeamSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { email, helpers, required } from '@vuelidate/validators';
import { useToast } from 'primevue/usetoast';
import { delay } from '@/utils/utility';
import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type { DraftedTeam } from '~/types/DraftedTeam';
import { PlayerPosition } from '~/types/PlayerPosition';
import type { Database, TablesInsert } from '~/types/database.types';
import type { Player } from '~/types/Player';

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const config = useRuntimeConfig();

const loading = ref(false);

const rules = computed(() => {
  return {
    team_name: {
      required: helpers.withMessage(
        'The team name field is required',
        required,
      ),
    },
    team_owner: {
      required: helpers.withMessage(
        'The team owner field is required',
        required,
      ),
    },
    team_email: {
      required: helpers.withMessage('The email field is required', required),
      email: helpers.withMessage('Invalid email format', email),
    },
  };
});

const draftedTeamData: Ref<TablesInsert<'drafted_teams_pending'>> = ref({
  team_name: '',
  team_owner: '',
  team_email: '',
  allowed_transfers: false,
});

const v$ = useVuelidate(rules, draftedTeamData);

const teamStructure = [
  { position: PlayerPosition.GOALKEEPER, count: 1 },
  { position: PlayerPosition.DEFENDER, count: 4 },
  { position: PlayerPosition.MIDFIELDER, count: 3 },
  { position: PlayerPosition.FORWARD, count: 3 },
];

const draftedTeamPlayers: Ref<
  | {
      draftedPlayerID?: number;
      position: PlayerPosition;
      selectedPlayer: Player;
    }[]
  | []
> = ref([]);

const fetchDraftedTeamData = async () => {
  const { data, error } = await supabase
    .from('drafted_teams_pending')
    .select(
      ` *,
        players:drafted_players_pending(
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

  draftedTeamData.value = data;
  setTeamPlayers(teamStructure, data.players);
};

const setTeamPlayers = (
  teamStructure: { position: number; count: number }[],
  players: DraftedPlayer[] | null = null,
) => {
  teamStructure.forEach(({ position, count }) => {
    const playersForPosition = players
      ? players.filter((player) => player.position === position)
      : [];

    const playersToAdd = players
      ? playersForPosition.slice(0, count)
      : Array.from({ length: count }, () => null);

    draftedTeamPlayers.value.push(
      ...playersToAdd.map((selectedPlayer) => ({
        draftedPlayerID: selectedPlayer?.drafted_player_id ?? 0,
        position,
        selectedPlayer,
      })),
    );
  });
};

if (route.query.id) {
  fetchDraftedTeamData();
} else {
  setTeamPlayers(teamStructure);
}

const teamBudget = computed(() =>
  draftedTeamData.value.allowed_transfers ? 85 : 95,
);

const selectedPlayerIds = computed(() => {
  return draftedTeamPlayers.value
    .filter((player) => player.selectedPlayer !== null)
    .map((player) => player.selectedPlayer?.player_id);
});

const calculateRemainingBudget = (): number => {
  const remainingBudget = teamBudget.value;

  const totalCost = draftedTeamPlayers.value.reduce(
    (accumulator, teamPlayerData) => {
      if (
        teamPlayerData.selectedPlayer &&
        teamPlayerData.selectedPlayer.cost !== null
      ) {
        return accumulator + teamPlayerData.selectedPlayer.cost;
      }
      return accumulator;
    },
    0,
  );

  return remainingBudget - totalCost;
};

const upsertTeamData = async (isEditing: boolean) => {
  const draftedTeamUpsertData: TablesInsert<'drafted_teams_pending'> = {
    team_name: draftedTeamData.value.team_name,
    team_owner: draftedTeamData.value.team_owner,
    team_email: draftedTeamData.value.team_email,
    allowed_transfers: draftedTeamData.value.allowed_transfers,
  };

  if (isEditing) {
    draftedTeamUpsertData.drafted_team_id =
      draftedTeamData.value.drafted_team_id;
  }

  const { data, error } = await supabase
    .from('drafted_teams_pending')
    .upsert(draftedTeamUpsertData)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

const upsertPlayerData = async (draftedTeamID: number, isEditing: boolean) => {
  const draftedPlayersUpsertData = draftedTeamPlayers.value.map((x) => {
    const data: TablesInsert<'drafted_players'> = {
      drafted_player: x.selectedPlayer?.player_id,
      drafted_team: draftedTeamID,
    };

    if (isEditing) {
      data.drafted_player_id = x.draftedPlayerID;
    }

    return data;
  });

  await supabase
    .from('drafted_players_pending')
    .upsert(draftedPlayersUpsertData);
};

const handleTeamSubmit = async () => {
  try {
    loading.value = true;

    await delay(1000);

    if (!formIsValid()) {
      return;
    }

    const isExistingDraftedTeam = !!draftedTeamData.value.key;

    const data = await upsertTeamData(isExistingDraftedTeam);

    await upsertPlayerData(data.drafted_team_id, isExistingDraftedTeam);

    router.push({
      path: 'team-builder',
      query: { id: data.key },
    });

    await useFetch('/api/send', {
      method: 'post',
      body: {
        email: draftedTeamData.value.team_email,
        html: `
          <p>Submitted team: ${draftedTeamPlayers.value
            .map((x) => x.selectedPlayer.web_name)
            .join(' | ')}</p>
          <p>You can edit your team by clicking this <a href="${
            config.public.siteURL
          }/team-builder?id=${data.key}">link</a></p>
        `,
      },
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Your team has been submitted, thank you!',
      life: 3000,
    });
  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
};

const formIsValid = () => {
  if (v$.value.$invalid) {
    toast.add({
      severity: 'error',
      summary: 'Form errors',
      detail: 'Team details are incorrect, please review validation errors',
      life: 3000,
    });
    return false;
  }

  if (
    draftedTeamPlayers.value.some(
      (draftedTeamPlayer) => draftedTeamPlayer.selectedPlayer === null,
    )
  ) {
    toast.add({
      severity: 'error',
      summary: 'Form errors',
      detail: 'Please select all players before submitting team',
      life: 3000,
    });
    return false;
  }

  if (calculateRemainingBudget() < 0) {
    toast.add({
      severity: 'error',
      summary: 'Form errors',
      detail: 'Your team is overbudget, please adjust your players',
      life: 3000,
    });
    return false;
  }
  return true;
};
</script>

<style scoped></style>
