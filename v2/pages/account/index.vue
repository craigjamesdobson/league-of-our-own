<script setup>
import { usePlayersStore } from '~/stores/players';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, helpers } from '@vuelidate/validators';
import { useAccountStore } from '@/stores/account';

const accountStore = useAccountStore();
accountStore.setUserData();

const userData = computed(() => accountStore.getUserData);

const formData = reactive({
  email: '',
  password: '',
});

const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage('The email field is required', required),
      email: helpers.withMessage('Invalid email format', email),
    },
    password: {
      required: helpers.withMessage('The password field is required', required),
      minLength: minLength(6),
    },
  };
});

const v$ = useVuelidate(rules, formData);

const playerStore = usePlayersStore();
const playerData = ref('');
const teamData = ref('');

const loading = ref(false);

const updatePlayerData = async () => {
  loading.value = true;
  await playerStore.updatePlayerData(playerData.value);
  playerData.value = '';
  loading.value = false;
};

const updateTeamData = async () => {
  loading.value = true;
  await playerStore.updateTeamData(teamData.value);
  playerData.value = '';
  loading.value = false;
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="flex items-center main-heading">
      <span>Admin Login</span>
      <button
        title="Sign out"
        @click.prevent="accountStore.signOutUser"
      >
        <Icon
          class="ml-2"
          name="la:sign-out-alt"
        />
      </button>
    </h1>
    <div v-if="userData.isSignedIn">
      <p class="m-4 text-center underline">
        Hello {{ userData.email }}
      </p>
      <div class="flex gap-4">
        <div class="flex flex-col items-start gap-4">
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
          <textarea
            id=""
            v-model="teamData"
            class="p-2 text-sm rounded-md"
            name="team-data"
            cols="75"
            rows="20"
            placeholder="Paste team data here..."
          />
          <button
            :class="{ 'pointer-events-none opacity-25': loading }"
            class="flex p-2 text-white bg-primary"
            @click="updateTeamData"
          >
            Update Teams
          </button>
        </div>
      </div>
      <div class="update-log" />
    </div>
    <div
      v-else
      class="flex flex-col justify-center p-10 mb-4 bg-white rounded-md w-96"
    >
      <form
        class="flex flex-col gap-6"
        action=""
      >
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
          :class="{'opacity-50'
            :v$.$invalid
          }"
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
  @apply focus:outline-none
}
</style>
