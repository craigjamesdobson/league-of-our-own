<script setup>
import { useAccount } from '@/logic/account/';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
import DraftedTeam from '@/components/DraftedTeams/DraftedTeam';

const draftedTeamStore = useDraftedTeamsStore();

definePageMeta({
  middleware: ['auth'],
});

const {
  teamData,
  updatePlayerData,
  updateTeamData,
  loading,
  accountStore,
  playerData,
} = useAccount();
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
    <div v-if="accountStore.userIsLoggedIn">
      <p class="m-4 text-center underline">
        Hello {{ accountStore.user.email }}
      </p>
      <div v-if="draftedTeamStore.draftedTeams">
        <DraftedTeam :drafted-team="draftedTeamStore.getDraftedTeamByID(1)" />
      </div>
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
            class="flex self-start p-2 text-white rounded-md bg-primary"
            @click="updatePlayerData"
          >
            Update Players
          </button>
        </div>
        <div class="flex flex-col gap-4">
          <textarea
            id=""
            v-model="teamData"
            class="p-2 text-sm rounded-md"
            name="player-data"
            cols="75"
            rows="20"
            placeholder="Paste team data here..."
          />
          <button
            :class="{ 'pointer-events-none opacity-25': loading }"
            class="flex self-start p-2 text-white rounded-md bg-primary"
            @click="updateTeamData"
          >
            Update Teams
          </button>
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
