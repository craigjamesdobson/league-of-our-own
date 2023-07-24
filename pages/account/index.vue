<script lang="ts" setup>
import { useAccount } from '@/modules/account/';

definePageMeta({
  middleware: ['auth'],
});

const {
  userData,
  updatePlayerData,
  loading,
  accountStore,
  draftedTeamsStore,
  playerData,
} = useAccount();

const selectedTeamID = ref(0);

const activeDraftedTeam = computed(() =>
  draftedTeamsStore.getDraftedTeamByID(+selectedTeamID.value)
);

const handleNewTransfer = (playerID: number) => {
  activeDraftedTeam.value.team_players
    .filter((x) => x.player_id === playerID)[0]
    .transfers.push({
      transfer_id: 0,
      current_transfer_expiry_date: '',
      transfer_week: 1,
    });
};
</script>

<template>
  <!-- <TransferModal /> -->
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="flex items-center main-heading">
      <span>Admin Login</span>
      <button title="Sign out" @click.prevent="accountStore.signOutUser">
        <Icon class="ml-2" name="la:sign-out-alt" />
      </button>
    </h1>
    <div v-if="userData.isSignedIn">
      <p class="m-4 text-center underline">Hello {{ userData.email }}</p>
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div class="flex flex-col gap-4">
          <textarea
            id=""
            v-model="playerData"
            class="p-2 text-sm rounded-md"
            name="player-data"
            cols="75"
            rows="20"
            placeholder="Paste player data here..."
          />
          <button
            :class="{ 'pointer-events-none opacity-25': loading }"
            class="flex p-2 text-white bg-primary"
            @click="updatePlayerData"
          >
            Update Players
          </button>
        </div>
        <div class="flex flex-col items-start gap-4">
          <div class="flex w-full">
            <select
              id="drafted-teams"
              v-model="selectedTeamID"
              name="drafted-teams"
              class="flex-1 p-2 mx-2"
            >
              <option disabled value="0">Select a team to edit</option>
              <option
                v-for="draftedTeam in draftedTeamsStore.getDraftedTeams"
                :key="draftedTeam.teamID"
                :value="draftedTeam.teamID"
                class="uppercase"
              >
                {{ draftedTeam.teamName }}
              </option>
            </select>
          </div>
          <div v-if="activeDraftedTeam" class="w-full">
            <div class="p-4 m-2 bg-white rounded-sm">
              <div
                class="flex items-center justify-between p-2 pt-0 mb-2 border-b border-gray-800"
              >
                <div class="flex flex-col uppercase">
                  <span class="font-black">{{
                    activeDraftedTeam.team_name
                  }}</span>
                  <span class="text-xs font-light">{{
                    activeDraftedTeam.team_owner
                  }}</span>
                </div>
                <div class="flex items-center">
                  <label for="checkbox">Allowed transfers?</label>
                  <input
                    id="checkbox"
                    v-model="activeDraftedTeam.allowed_transfers"
                    class="w-5 h-5 ml-4"
                    type="checkbox"
                  />
                </div>
              </div>
              <div
                v-for="player in activeDraftedTeam.team_players"
                :key="player.player_id"
                class="relative text-sm"
              >
                <EditablePlayer
                  v-model:model-value="player.player_id"
                  :transfer-status="player.transfers.length > 0 ? 1 : 0"
                  :class="{
                    'opacity-25': player.transfers.length > 0,
                  }"
                  @update:new-transfer="handleNewTransfer"
                />
                <div v-if="player.transfers.length > 0">
                  <template
                    v-for="transferredPlayer in player.transfers"
                    :key="transferredPlayer.transfer_id"
                  >
                    <EditablePlayer
                      v-model:model-value="transferredPlayer.transfer_id"
                      :transfer-status="2"
                    />
                    <div
                      class="flex items-center w-full border-b border-gray-100"
                    >
                      <div class="flex w-8/12 p-2">
                        <label
                          :for="
                            'active-transfer-expiry-' +
                            transferredPlayer.transfer_id
                          "
                          >Active week transfer expiry date</label
                        >
                        <input
                          :id="
                            'active-transfer-expiry-' +
                            transferredPlayer.transfer_id
                          "
                          :v-model="
                            transferredPlayer.current_transfer_expiry_date
                          "
                          type="text"
                        />
                      </div>
                      <div class="flex flex-row w-4/12 p-2">
                        <label
                          :for="
                            'transfer-week-' + transferredPlayer.transfer_id
                          "
                          >Transfer week</label
                        >
                        <input
                          :id="'transfer-week-' + transferredPlayer.transfer_id"
                          :v-model="transferredPlayer.transfer_week"
                          type="text"
                        />
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="update-log" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
input {
  @apply focus:outline-none;
}
</style>
