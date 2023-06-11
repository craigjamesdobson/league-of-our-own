import { usePlayersStore } from '../../stores/players';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, helpers } from '@vuelidate/validators';
import { useAccountStore } from '../../stores/account';
import { useDraftedTeamsStore } from '../../stores/draftedTeams';

const useAccount = () => {
    
    const draftedTeamsStore = useDraftedTeamsStore();
    draftedTeamsStore.fetchDraftedTeams();

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

    return {
        userData,
        v$,
        updatePlayerData,
        updateTeamData,
        playerData,
        formData,
        accountStore,
        loading,
        draftedTeamsStore
    };
};

export { useAccount };