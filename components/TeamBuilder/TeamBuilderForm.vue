<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { email, helpers, required } from '@vuelidate/validators';
import { useToast } from 'primevue/usetoast';
import { delay } from '@/utils/utility';
import { PlayerPosition } from '~/types/PlayerPosition';
import type { Database, TablesInsert } from '~/types/database-generated.types';
import type { Player } from '~/types/Player';
import { generateTeamEmail } from '@/pages/team-builder/email'

const supabase = useSupabaseClient<Database>();
const router = useRouter();
const toast = useToast();
const config = useRuntimeConfig();

const loading = ref(false);

const rules = computed(() => {
  return {
    team_name: {
      required: helpers.withMessage('The team name field is required', required)
    },
    team_owner: {
      required: helpers.withMessage(
        'The team owner field is required',
        required
      )
    },
    team_email: {
      required: helpers.withMessage('The email field is required', required),
      email: helpers.withMessage('Invalid email format', email)
    }
  };
});

const draftedTeamData = defineModel<TablesInsert<'drafted_teams'>>('draftedTeamData', { required: true })
const draftedTeamPlayers = defineModel<DraftedTeamPlayer[]>('draftedTeamPlayers', { required: true })
const isExistingDraftedTeam = computed(() => !!draftedTeamData.value.key);
const v$ = useVuelidate(rules, draftedTeamData);

interface DraftedTeamPlayer {
  draftedPlayerID?: number;
  position: PlayerPosition;
  selectedPlayer: Player;
}


const teamBudget = computed(() =>
  draftedTeamData.value.allowed_transfers ? 85 : 95
);

const calculateRemainingBudget = (): number => {
  const remainingBudget = teamBudget.value;

  const totalCost: number = draftedTeamPlayers.value.reduce(
    (prev: number, curr: DraftedTeamPlayer) =>
      prev + (curr.selectedPlayer?.cost ?? 0),
    0
  );
  return remainingBudget - totalCost;
};

const upsertTeamData = async (isEditing: boolean) => {
  const draftedTeamUpsertData: TablesInsert<'drafted_teams'> = {
    team_name: draftedTeamData.value.team_name,
    team_owner: draftedTeamData.value.team_owner,
    team_email: draftedTeamData.value.team_email,
    allowed_transfers: draftedTeamData.value.allowed_transfers,
    active_season: '24-25'
  };

  if (isEditing) {
    draftedTeamUpsertData.drafted_team_id =
      draftedTeamData.value.drafted_team_id;
  }

  const { data, error } = await supabase
    .from('drafted_teams')
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
      drafted_team: draftedTeamID
    };

    if (isEditing) {
      data.drafted_player_id = x.draftedPlayerID;
    }

    return data;
  });

  await supabase
    .from('drafted_players')
    .upsert(draftedPlayersUpsertData);
};

const handleTeamSubmit = async () => {
  try {
    loading.value = true;

    await delay(1000);

    if (!formIsValid()) {
      return;
    }

    const data = await upsertTeamData(isExistingDraftedTeam.value);

    await upsertPlayerData(data.drafted_team_id, isExistingDraftedTeam.value);

    router.push({
      path: 'team-builder',
      query: { id: data.key }
    });

    await useFetch('/api/send', {
      method: 'post',
      body: {
        email: draftedTeamData.value.team_email,
        html: generateTeamEmail(draftedTeamPlayers.value)
        // html: `
        //   <p>Submitted team: ${draftedTeamPlayers.value
        //     .map((x) => x.selectedPlayer.web_name)
        //     .join(' | ')}</p>
        //   <p>You can edit your team by clicking this <a href="${config.public.siteURL
        //   }/team-builder?id=${data.key}">link</a></p>
        // `
      }
    });

    draftedTeamData.value = data;

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Your team has been submitted, thank you!',
      life: 3000
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
      life: 3000
    });
    return false;
  }

  if (
    draftedTeamPlayers.value.some(
      (draftedTeamPlayer) => draftedTeamPlayer.selectedPlayer === null
    )
  ) {
    toast.add({
      severity: 'error',
      summary: 'Form errors',
      detail: 'Please select all players before submitting team',
      life: 3000
    });
    return false;
  }

  if (calculateRemainingBudget() < 0) {
    toast.add({
      severity: 'error',
      summary: 'Form errors',
      detail: 'Your team is overbudget, please adjust your players',
      life: 3000
    });
    return false;
  }
  return true;
};
</script>

<template>
  <Toast />
  <Message severity="warn" :closable="false" v-if="isExistingDraftedTeam">
    You are editing your existing team. <br /> It was last edited on <strong>{{ new
      Date(draftedTeamData?.updated_at).toLocaleDateString('en-GB') }}</strong>
  </Message>
  <div class="flex flex-col text-xs" v-else>
    <Divider />
    <p class="mb-5">Pick your team, fill in the form below and then submit your team.</p>
    <p>Once you submit your team you will recieve an email confirming your selection and a link to edit your team if you
      wish.</p>
    <Divider />
  </div>
  <form v-if="draftedTeamData" class="flex flex-col items-start gap-5">
    <div class="flex w-full flex-col gap-1">
      <label class="font-bold uppercase" for="team_name">Team name</label>
      <GenericFormField v-model="draftedTeamData.team_name" :validation="v$.team_name" type="text" />
    </div>
    <div class="flex w-full flex-col gap-1">
      <label class="font-bold uppercase" for="team_owner">Team owner</label>
      <GenericFormField v-model="draftedTeamData.team_owner" :validation="v$.team_owner" type="text" />
    </div>
    <div class="flex w-full flex-col gap-1">
      <label class="font-bold uppercase" for="team_email">Team email</label>
      <GenericFormField v-model="draftedTeamData.team_email" :validation="v$.team_email" type="email" />
    </div>
    <div class="flex w-full flex-col gap-1">
      <div class="flex items-center">
        <Checkbox v-model="draftedTeamData.allowed_transfers" input-id="allowed_transfers" :binary="true" />
        <label for="allowed_transfers" class="ml-2.5 font-bold uppercase">Transfers Allowed</label>
      </div>
    </div>
    <Message :severity="calculateRemainingBudget() < 0 ? 'error' : 'success'" class="w-full" :closable="false">
      <template #messageicon>
        <Icon class="mr-2.5 self-start" size="22" name="tabler:pig-money" />
      </template>
      <div class="flex flex-col items-center gap-2.5">
        <div class="flex items-center gap-2.5">
          Transfer Budget Remaining:
          <span class="text-lg font-black">{{
            calculateRemainingBudget().toFixed(1)
          }}</span>
        </div>
      </div>
    </Message>
    <Button :loading="loading" class="w-full" label="Submit team" @click="handleTeamSubmit" />
  </form>
</template>
