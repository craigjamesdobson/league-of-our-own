<script setup>
import { useAccount } from '@/modules/account/';

const {
  userData,
  v$,
  updatePlayerData,
  formData,
  loading,
  accountStore,
  draftedTeamsStore,
  playerData,
} = useAccount();

const selectedTeamID = ref(0);

const activeDraftedTeam = computed(() =>
  draftedTeamsStore.getDraftedTeamByID(+selectedTeamID.value)
);

const createRawTeamData = () =>
  console.log(activeDraftedTeam.value.teamPlayers?.map((x) => x.id));
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
          <select
            id="drafted-teams"
            v-model="selectedTeamID"
            name="drafted-teams"
            class="w-full p-2 m-2"
          >
            <option disabled value="0">Select a team to edit</option>
            <option
              v-for="draftedTeam in draftedTeamsStore.getDraftedTeamsWithTransfers"
              :key="draftedTeam.teamID"
              :value="draftedTeam.teamID"
              class="uppercase"
            >
              {{ draftedTeam.teamName }}
            </option>
          </select>
          <div v-if="activeDraftedTeam" class="w-full">
            <DraftedTeam :drafted-team="activeDraftedTeam" class="w-full" />
            <button
              :class="{ 'pointer-events-none opacity-25': loading }"
              class="flex w-full p-2 m-2 text-white bg-primary"
              @click="createRawTeamData"
            >
              Update Teams
            </button>
          </div>
        </div>
      </div>
      <div class="update-log" />
    </div>
    <div
      v-else
      class="flex flex-col justify-center p-10 mb-4 bg-white rounded-md w-96"
    >
      <form class="flex flex-col gap-6" action="">
        <FormField
          v-model="formData.email"
          label="Email"
          :validation="v$.email"
          icon="material-symbols:alternate-email"
        />
        <FormField
          v-model="formData.password"
          label="Password"
          :validation="v$.password"
          icon="mdi:password-outline"
        />
        <button
          class="px-1 py-2 text-white rounded-md bg-primary"
          :class="{ 'opacity-50': v$.$invalid }"
          :disabled="v$.$invalid"
          @click.prevent="accountStore.signInUser(formData)"
        >
          Log In
        </button>
        <button
          class="underline"
          @click.prevent="accountStore.resetUserPassword(formData.email)"
        >
          Reset Password
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
input {
  @apply focus:outline-none;
}
</style>
