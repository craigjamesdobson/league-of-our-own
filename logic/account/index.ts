import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, helpers } from '@vuelidate/validators';
import { useAccountStore } from '@/stores/account';
import { usePlayerStore } from '@/stores/players';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';

const useAccount = () => {
  const accountStore = useAccountStore();
  const draftedTeamsStore = useDraftedTeamsStore();

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
        required: helpers.withMessage(
          'The password field is required',
          required
        ),
        minLength: minLength(6),
      },
    };
  });

  const v$ = useVuelidate(rules, formData);

  const playerStore = usePlayerStore();
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
    await draftedTeamsStore.upsertTeamData(teamData.value);
    playerData.value = '';
    loading.value = false;
  };

  return {
    v$,
    updatePlayerData,
    updateTeamData,
    playerData,
    teamData,
    formData,
    accountStore,
    loading,
  };
};

export { useAccount };
