<template>
  <div class="flex gap-5">
    <div class="p-5 w-96">
      <h1 class="text-xl font-black uppercase mb-5">Team Details</h1>
      <form class="flex flex-col gap-5 items-start">
        <div class="flex flex-col gap-1 w-full">
          <label class="uppercase font-bold" for="team_name">Team name</label>
          <InputText id="team_name" v-model="draftedTeamData.team_name" />
        </div>
        <div class="flex flex-col gap-1 w-full">
          <label class="uppercase font-bold" for="team_owner">Team owner</label>
          <InputText id="team_owner" v-model="draftedTeamData.team_owner" />
        </div>
        <div class="flex flex-col gap-1 w-full">
          <label class="uppercase font-bold" for="team_owner">Team email</label>
          <InputText id="team_owner" v-model="draftedTeamData.team_email" />
          <small>Please provide an email so we can update you on scores</small>
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
                calculateRemainingBudget()
              }}</span>
            </div>
          </div>
        </Message>
        <Button class="w-full" label="Submit team" />
      </form>
    </div>
    <div class="grid grid-cols-12 justify-center">
      <template v-for="(player, index) in draftedTeamPlayers" :key="index">
        <PlayerSection :player="player" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayerPosition } from '~/types/PlayerPosition';

const draftedTeamData = ref({
  team_name: '',
  team_owner: '',
  team_email: '',
  allowed_transfers: false,
});

const teamBudget = computed(() =>
  draftedTeamData.value.allowed_transfers ? 85 : 95
);

const draftedTeamPlayers = ref([
  {
    position: PlayerPosition.GOALKEEPER,
    selectedPlayer: null,
  },
  {
    position: PlayerPosition.DEFENDER,
    selectedPlayer: null,
  },
  {
    position: PlayerPosition.DEFENDER,
    selectedPlayer: null,
  },
  {
    position: PlayerPosition.DEFENDER,
    selectedPlayer: null,
  },
  {
    position: PlayerPosition.DEFENDER,
    selectedPlayer: null,
  },
  {
    position: PlayerPosition.MIDFIELDER,
    selectedPlayer: null,
  },
  {
    position: PlayerPosition.MIDFIELDER,
    selectedPlayer: null,
  },
  {
    position: PlayerPosition.MIDFIELDER,
    selectedPlayer: null,
  },
  {
    position: PlayerPosition.FORWARD,
    selectedPlayer: null,
  },
  {
    position: PlayerPosition.FORWARD,
    selectedPlayer: null,
  },
  {
    position: PlayerPosition.FORWARD,
    selectedPlayer: null,
  },
]);

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
    0
  );

  return (remainingBudget - totalCost).toFixed(1);
};
</script>

<style scoped></style>
