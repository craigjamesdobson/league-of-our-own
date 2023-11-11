<script setup>
import { useAccount } from '@/logic/account/';

definePageMeta({
  middleware: ['auth'],
});

const sendingMessage = ref(false);

const sendEmail = async () => {
  try {
    sendingMessage.value = true;
    const { data } = await useFetch('/api/send', {
      method: 'post',
      body: { email: 'dobson.cj@gmail.com' },
    });
    console.log(data.value);
    alert('Email has been sent!');
  } catch (err) {
    console.log(err);
  } finally {
    sendingMessage.value = false;
  }
};

const {
  userData,
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
    <button
      class="bg-primary p-2 text-white rounded-md"
      :class="{ 'pointer-events-none opacity-25': sendingMessage }"
      @click="sendEmail"
    >
      Send email
    </button>
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
