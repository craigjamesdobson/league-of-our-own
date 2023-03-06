<script setup>
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { usePlayersStore } from '~/stores/players';

const formData = reactive({
  email: '',
  password: ''
});

const user = reactive({
  email: null,
  isSignedIn: false
});

onMounted(() => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    user.email = auth.currentUser.email;
    user.isSignedIn = true;
  }
});

const auth = getAuth();
const signInUser = () => {
  signInWithEmailAndPassword(auth, formData.email, formData.password)
    .then((userCredential) => {
      // Signed in
      console.log(user);
      user.email = userCredential.user.email;
      user.isSignedIn = true;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
};

const signOutUser = () => {
  signOut(auth).then(() => {
  // Sign-out successful.
  }).catch((error) => {
    throw new Error(error);
  });
};
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
    <h1 class="main-heading">
      Admin Login
    </h1>
    <div v-if="user.isSignedIn">
      <p>Hello {{ user.email }}</p>
      <textarea
        id=""
        v-model="playerData"
        name="player-data"
        cols="50"
        rows="10"
        placeholder="Paste player data here..."
      />
      <button
        :class="{ 'pointer-events-none opacity-25': loading }"
        class="flex p-2 text-white bg-primary"
      >
        Update Players
      </button>
      <textarea
        id=""
        v-model="teamData"
        name="team-data"
        cols="50"
        rows="10"
        placeholder="Paste team data here..."
      />
      <button
        :class="{ 'pointer-events-none opacity-25': loading }"
        class="flex p-2 text-white bg-primary"
        @click="updateTeamData"
      >
        Update Teams
      </button>
      <div class="update-log" />
      <button @click="signOutUser">
        Sign out
      </button>
    </div>
    <div
      v-else
      class="flex flex-col justify-center p-10 mb-4 bg-white rounded-md w-96"
    >
      <form
        class="flex flex-col gap-6"
        action=""
      >
        <div class="relative flex flex-col">
          <label
            class="mb-2 text-xs"
            for="email"
          >Email</label>
          <input
            id="email"
            v-model="formData.email"
            class="px-2 py-2 bg-white border rounded-md peer"
            type="email"
          >
        </div>
        <div class="relative flex flex-col">
          <label
            class="mb-2 text-xs"
            for="password"
          >Password</label>
          <input
            id="password"
            v-model="formData.password"
            class="px-2 py-2 bg-white border rounded-md peer"
            type="password"
          >
        </div>
        <button
          class="px-1 py-2 text-white rounded-md bg-primary"
          @click.prevent="signInUser"
        >
          Log In
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
