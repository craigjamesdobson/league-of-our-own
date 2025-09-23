import { useToast } from 'primevue/usetoast';
import type { DraftedTeamPlayer } from '~/types/DraftedTeamPlayer';
import { PlayerPosition } from '~/types/PlayerPosition';
import type { Database, TablesInsert, Tables } from '~/types/database.types';
import type { Database as DatabaseGenerated } from '~/types/database-generated.types';
import { generateAdminEmail, generateTeamEmail } from '@/pages/team-builder/email';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
import { delay } from '@/utils/utility';

interface LoadingState {
  fetchingTeam: boolean;
  submittingForm: boolean;
}

type DraftedPlayerFromQuery = {
  drafted_player_id: number;
  drafted_team: number | null;
} & DatabaseGenerated['public']['Views']['players_view']['Row'];

const DEFAULT_TEAM_STRUCTURE = [
  { position: PlayerPosition.GOALKEEPER, count: 1 },
  { position: PlayerPosition.DEFENDER, count: 4 },
  { position: PlayerPosition.MIDFIELDER, count: 3 },
  { position: PlayerPosition.FORWARD, count: 3 },
];

const createEmptyTeamData = (): TablesInsert<'drafted_teams'> => ({
  active_season: '25-26',
  team_name: '',
  team_owner: '',
  team_email: '',
  contact_number: null,
  allow_communication: false,
  allowed_transfers: false,
  total_team_value: 0,
});

export const useTeamBuilder = () => {
  const supabase = useSupabaseClient<Database>();
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const draftedTeamsStore = useDraftedTeamsStore();

  const loading = ref<LoadingState>({
    fetchingTeam: false,
    submittingForm: false,
  });

  const error = ref<string | null>(null);
  const draftedTeamData = ref<Tables<'drafted_teams'> | TablesInsert<'drafted_teams'>>(createEmptyTeamData());
  const draftedTeamPlayers = ref<DraftedTeamPlayer[]>([]);
  const turnstileToken = ref<string | null>(null);

  const isExistingDraftedTeam = computed(() => !!draftedTeamData.value.key);

  const selectedPlayerIds = computed(() => {
    return draftedTeamPlayers.value
      .filter(player => player.selectedPlayer !== null)
      .map(player => player.selectedPlayer!.player_id);
  });

  const teamBudget = computed(() =>
    draftedTeamData.value.allowed_transfers ? 85 : 90,
  );

  const teamValue = ref(0);
  watchEffect(() => {
    const value = draftedTeamPlayers.value.reduce(
      (prev: number, curr: DraftedTeamPlayer) =>
        prev + (curr.selectedPlayer?.cost ?? 0),
      0,
    );
    teamValue.value = value;
  });

  const remainingBudget = computed(() => {
    return teamBudget.value - teamValue.value;
  });

  const isOverBudget = computed(() => remainingBudget.value < 0);

  const fetchDraftedTeamData = async (teamId?: string): Promise<void> => {
    const id = teamId || route.query.id;
    if (!id || typeof id !== 'string') {
      error.value = 'Invalid team ID';
      toast.add({
        severity: 'error',
        summary: 'Invalid team ID',
        detail: 'No valid team ID provided',
        life: 3000,
      });
      setTeamPlayers(DEFAULT_TEAM_STRUCTURE);
      return;
    }

    try {
      loading.value.fetchingTeam = true;
      error.value = null;

      const { data, error: fetchError } = await supabase
        .from('drafted_teams')
        .select(
          ` *,
            players:drafted_players(
              drafted_player_id,
              drafted_team,
              ...players_view(*)
            )
          `,
        )
        .eq('key', id)
        .single();

      if (fetchError) {
        error.value = 'No team found';
        toast.add({
          severity: 'error',
          summary: 'No team found',
          detail: 'No team was found using that id',
          life: 3000,
        });
        setTeamPlayers(DEFAULT_TEAM_STRUCTURE);
        return;
      }

      draftedTeamData.value = data;
      setTeamPlayers(DEFAULT_TEAM_STRUCTURE, data.players);
    }
    catch {
      error.value = 'Failed to fetch team data';
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch team data',
        life: 3000,
      });
      setTeamPlayers(DEFAULT_TEAM_STRUCTURE);
    }
    finally {
      loading.value.fetchingTeam = false;
    }
  };

  const filterPlayersByPosition = (players: DraftedPlayerFromQuery[], position: number): DraftedPlayerFromQuery[] => {
    try {
      return players.filter(player => player.position === position);
    }
    catch (error) {
      console.error('Error filtering players by position:', error);
      return [];
    }
  };

  const createEmptyPlayerSlots = (count: number): null[] => {
    if (count < 0) {
      console.warn('Invalid count for creating empty player slots:', count);
      return [];
    }
    return Array.from({ length: count }, () => null);
  };

  const createDraftedTeamPlayer = (draftedPlayer: DraftedPlayerFromQuery | null, position: number): DraftedTeamPlayer => {
    return reactive({
      draftedPlayerID: draftedPlayer?.drafted_player_id ?? undefined,
      position,
      selectedPlayer: draftedPlayer ? draftedPlayer as Tables<'players_view'> : null,
    });
  };

  const mapPlayersToTeamStructure = (
    players: DraftedPlayerFromQuery[] | null,
    position: number,
    count: number,
  ): DraftedTeamPlayer[] => {
    try {
      if (!players) {
        const emptySlots = createEmptyPlayerSlots(count);
        return emptySlots.map(slot => createDraftedTeamPlayer(slot, position));
      }

      const playersForPosition = filterPlayersByPosition(players, position);
      const playersToAdd = playersForPosition.slice(0, count);
      return playersToAdd.map(draftedPlayer => createDraftedTeamPlayer(draftedPlayer, position));
    }
    catch (error) {
      console.error('Error mapping players to team structure:', error);
      const emptySlots = createEmptyPlayerSlots(count);
      return emptySlots.map(slot => createDraftedTeamPlayer(slot, position));
    }
  };

  const setTeamPlayers = (
    teamStructure: { position: number; count: number }[],
    players: DraftedPlayerFromQuery[] | null = null,
  ): void => {
    try {
      const newPlayers: DraftedTeamPlayer[] = [];
      teamStructure.forEach(({ position, count }) => {
        const mappedPlayers = mapPlayersToTeamStructure(players, position, count);
        newPlayers.push(...mappedPlayers);
      });

      draftedTeamPlayers.value = newPlayers;
    }
    catch (error) {
      console.error('Error setting team players:', error);
      draftedTeamPlayers.value = [];
    }
  };

  const submitTeam = async (): Promise<void> => {
    try {
      loading.value.submittingForm = true;
      error.value = null;

      await delay(1000);

      if (!validateForm()) {
        return;
      }

      // Verify Turnstile token using built-in endpoint
      const turnstileVerification = await $fetch('/_turnstile/validate', {
        method: 'POST',
        body: { token: turnstileToken.value },
      });

      if (!turnstileVerification.success) {
        toast.add({
          severity: 'error',
          summary: 'Security Check Failed',
          detail: 'Security verification failed. Please try again.',
          life: 3000,
        });
        return;
      }

      const teamData = await upsertTeamData(isExistingDraftedTeam.value);

      await upsertPlayerData(teamData.drafted_team_id, isExistingDraftedTeam.value);

      router.push({
        path: 'team-builder',
        query: { id: teamData.key },
      });

      await useFetch('/api/user-email', {
        method: 'post',
        body: {
          title: (teamData.edited_count ?? 0) > 0 ? 'Your team has been updated' : 'Thank you for your team submission',
          email: draftedTeamData.value.team_email,
          html: generateTeamEmail(draftedTeamPlayers.value, teamData),
        },
      });

      if (!isExistingDraftedTeam.value) {
        await useFetch('/api/admin-email', {
          method: 'post',
          body: {
            email: 'leagueofourown.fpl@gmail.com',
            html: generateAdminEmail(draftedTeamPlayers.value, teamData),
          },
        });
      }

      await fetchDraftedTeamData(teamData.key);

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Your team has been submitted, thank you!',
        life: 3000,
      });
    }
    catch {
      error.value = 'Failed to submit team';
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit team. Please try again.',
        life: 3000,
      });
    }
    finally {
      loading.value.submittingForm = false;
    }
  };

  const resetForm = (): void => {
    draftedTeamData.value = createEmptyTeamData();
    setTeamPlayers(DEFAULT_TEAM_STRUCTURE);
    error.value = null;
  };

  const validateForm = (): boolean => {
    if (
      draftedTeamPlayers.value.some(
        draftedTeamPlayer => draftedTeamPlayer.selectedPlayer === null,
      )
    ) {
      toast.add({
        severity: 'error',
        summary: 'Form errors',
        detail: 'Please select all players before submitting team',
        life: 3000,
      });
      return false;
    }

    if (isOverBudget.value) {
      toast.add({
        severity: 'error',
        summary: 'Form errors',
        detail: 'Your team is overbudget, please adjust your players',
        life: 3000,
      });
      return false;
    }

    if (!turnstileToken.value) {
      toast.add({
        severity: 'error',
        summary: 'Security Check Required',
        detail: 'Please complete the security check before submitting',
        life: 3000,
      });
      return false;
    }

    return true;
  };

  const upsertTeamData = async (isEditing: boolean): Promise<Tables<'drafted_teams'>> => {
    const draftedTeamUpsertData: TablesInsert<'drafted_teams'> = {
      team_name: draftedTeamData.value.team_name,
      team_owner: draftedTeamData.value.team_owner,
      team_email: draftedTeamData.value.team_email,
      contact_number: draftedTeamData.value.contact_number,
      allow_communication: draftedTeamData.value.allow_communication,
      allowed_transfers: draftedTeamData.value.allowed_transfers,
      active_season: '25-26',
      total_team_value: teamValue.value,
    };

    if (isEditing) {
      draftedTeamUpsertData.drafted_team_id = draftedTeamData.value.drafted_team_id;
      draftedTeamUpsertData.edited_count = (draftedTeamData.value.edited_count ?? 0) + 1;
    }

    return await draftedTeamsStore.upsertDraftedTeam(draftedTeamUpsertData);
  };

  const upsertPlayerData = async (draftedTeamID: number, isEditing: boolean): Promise<void> => {
    const draftedPlayersUpsertData = draftedTeamPlayers.value.map((x) => {
      const data: TablesInsert<'drafted_players'> = {
        drafted_player: x.selectedPlayer?.player_id,
        drafted_team: draftedTeamID,
      };

      if (isEditing) {
        data.drafted_player_id = x.draftedPlayerID;
      }

      return data;
    });

    await draftedTeamsStore.upsertDraftedPlayers(draftedPlayersUpsertData);
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    draftedTeamData,
    draftedTeamPlayers,
    turnstileToken,

    isExistingDraftedTeam,
    selectedPlayerIds,
    teamBudget,
    teamValue: readonly(teamValue),
    remainingBudget,
    isOverBudget,

    fetchDraftedTeamData,
    setTeamPlayers,
    submitTeam,
    resetForm,
  };
};
