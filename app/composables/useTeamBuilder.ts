import { useToast as useNuxtToast } from '@nuxt/ui/composables';
import type { DraftedTeamPlayer } from '~/types/DraftedTeamPlayer';
import { PlayerPosition } from '~/types/PlayerPosition';
import type { TablesInsert, Tables } from '~/types/database.types';
import type { Database as DatabaseGenerated } from '~/types/database-generated.types';
import type { TeamSubmissionResponse } from '~~/shared/types/teamSubmission';
import { SUPPORT_EMAIL } from '~~/shared/utils/contact';
import { delay } from '@/utils/utility';

interface LoadingState {
  fetchingTeam: boolean;
  submittingForm: boolean;
}

type UnknownError = {
  data?: UnknownError;
  message?: unknown;
  response?: UnknownError;
  status?: unknown;
  statusCode?: unknown;
  statusMessage?: unknown;
};

const asUnknownError = (error: unknown): UnknownError =>
  error && typeof error === 'object' ? error as UnknownError : {};

const asStatusCode = (value: unknown): number | undefined => {
  const statusCode = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(statusCode) ? statusCode : undefined;
};

const getErrorStatusCode = (error: unknown): number | undefined => {
  const candidate = asUnknownError(error);
  return asStatusCode(candidate.statusCode)
    ?? asStatusCode(candidate.status)
    ?? asStatusCode(asUnknownError(candidate.response).status)
    ?? asStatusCode(asUnknownError(candidate.data).statusCode);
};

const getErrorMessages = (error: unknown): string[] => {
  const candidate = asUnknownError(error);
  const data = asUnknownError(candidate.data);
  return [candidate.message, candidate.statusMessage, data.message, data.statusMessage]
    .filter((message): message is string => typeof message === 'string');
};

const isTeamRegistrationClosedError = (error: unknown): boolean => {
  const messages = getErrorMessages(error);
  return getErrorStatusCode(error) === 403
    || messages.some(message => message.includes('Team registration is closed'));
};

export const getTeamSubmissionErrorAlert = (error: unknown, editing: boolean) => {
  if (isTeamRegistrationClosedError(error)) {
    return {
      title: editing ? 'Team editing closed' : 'Team submissions closed',
      description: editing
        ? 'The submission deadline has passed, so saved teams can no longer be changed.'
        : 'The submission deadline has passed, so new teams are no longer being accepted.',
    };
  }

  return {
    title: editing ? 'Unable to load team' : 'Submission failed',
    description: editing
      ? 'We could not load that saved team. Please check the link and try again.'
      : 'We could not submit your team. Please try again.',
  };
};

type DraftedPlayerFromQuery = {
  drafted_player_id: number;
  drafted_team: number | null;
  total_points: number | null;
} & DatabaseGenerated['public']['Views']['players_view']['Row'];

const DEFAULT_TEAM_STRUCTURE = [
  { position: PlayerPosition.GOALKEEPER, count: 1 },
  { position: PlayerPosition.DEFENDER, count: 4 },
  { position: PlayerPosition.MIDFIELDER, count: 3 },
  { position: PlayerPosition.FORWARD, count: 3 },
];

const createEmptyTeamData = (activeSeason: string): TablesInsert<'drafted_teams'> => ({
  active_season: activeSeason,
  team_name: '',
  team_owner: '',
  team_email: '',
  contact_number: null,
  allow_communication: false,
  allowed_transfers: false,
  total_team_value: 0,
});

export const useTeamBuilder = () => {
  const { activeSeason } = useAppSettings();
  const route = useRoute();
  const router = useRouter();
  const toast = useNuxtToast();

  const addToast = (
    color: 'error' | 'success',
    title: string,
    description: string,
  ) => {
    toast.add({
      color,
      title,
      description,
      duration: 3000,
    });
  };

  const loading = ref<LoadingState>({
    fetchingTeam: false,
    submittingForm: false,
  });

  const error = ref<string | null>(null);
  const saveConfirmation = ref<'submitted' | 'submitted-email-failed' | 'updated' | 'existing' | null>(null);
  const draftedTeamData = ref<Tables<'drafted_teams'> | TablesInsert<'drafted_teams'>>(createEmptyTeamData(activeSeason.value));
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
      addToast('error', 'Invalid team ID', 'No valid team ID provided');
      setTeamPlayers(DEFAULT_TEAM_STRUCTURE);
      return;
    }

    try {
      loading.value.fetchingTeam = true;
      error.value = null;

      const data = await $fetch<{
        players: DraftedPlayerFromQuery[];
      } & Omit<Tables<'drafted_teams'>, 'key'>>(`/api/team-submission/${encodeURIComponent(id)}`);

      // The edit key authorises subsequent updates, but it is already present
      // in the URL and should not be echoed by the server response.
      draftedTeamData.value = { ...data, key: id };
      setTeamPlayers(DEFAULT_TEAM_STRUCTURE, data.players);
    }
    catch (fetchError) {
      const alert = getTeamSubmissionErrorAlert(fetchError, true);
      error.value = alert.description;
      addToast('error', alert.title, alert.description);
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
    if (loading.value.submittingForm) return;

    try {
      loading.value.submittingForm = true;
      error.value = null;
      saveConfirmation.value = null;

      await delay(1000);

      if (!validateForm()) {
        return;
      }

      const wasEditing = isExistingDraftedTeam.value;
      const result = await $fetch<TeamSubmissionResponse<Tables<'drafted_teams'>>>('/api/team-submission', {
        method: 'POST',
        body: {
          turnstileToken: turnstileToken.value,
          editKey: wasEditing ? draftedTeamData.value.key : null,
          teamName: draftedTeamData.value.team_name,
          teamOwner: draftedTeamData.value.team_owner,
          teamEmail: draftedTeamData.value.team_email,
          contactNumber: draftedTeamData.value.contact_number,
          allowCommunication: draftedTeamData.value.allow_communication,
          allowedTransfers: draftedTeamData.value.allowed_transfers,
          playerIds: draftedTeamPlayers.value.map(player => player.selectedPlayer!.player_id),
        },
      });

      if (result.outcome === 'existing-team') {
        addToast(
          'error',
          'Team already registered',
          `Please check your original confirmation email for the link to edit your team. If you cannot find it, email ${SUPPORT_EMAIL} for help.`,
        );
        saveConfirmation.value = 'existing';
        return;
      }

      const teamData = result.team;

      router.push({
        path: 'team-builder',
        query: { id: teamData.key },
      });

      const emailDeliveryFailed = result.outcome === 'created' && !result.emailSent;

      try {
        await fetchDraftedTeamData(teamData.key);
        if (error.value) {
          draftedTeamData.value = teamData;
        }
      }
      catch (refreshError) {
        console.error('Team saved but could not refresh the edit form:', refreshError);
        draftedTeamData.value = teamData;
      }

      addToast(
        emailDeliveryFailed ? 'error' : 'success',
        emailDeliveryFailed ? 'Team saved' : 'Success',
        emailDeliveryFailed
          ? 'Your team was saved, but a confirmation email could not be sent. Please contact the league administrator.'
          : result.outcome === 'updated'
            ? 'Your changes have been saved. No new email has been sent.'
            : 'Your team has been submitted, thank you!',
      );
      saveConfirmation.value = emailDeliveryFailed
        ? 'submitted-email-failed'
        : result.outcome === 'updated' ? 'updated' : 'submitted';
    }
    catch (submissionError) {
      const alert = getTeamSubmissionErrorAlert(submissionError, isExistingDraftedTeam.value);
      error.value = alert.description;
      addToast('error', alert.title, alert.description);
    }
    finally {
      loading.value.submittingForm = false;
    }
  };

  const resetForm = (): void => {
    draftedTeamData.value = createEmptyTeamData(activeSeason.value);
    setTeamPlayers(DEFAULT_TEAM_STRUCTURE);
    error.value = null;
    saveConfirmation.value = null;
  };

  const validateForm = (): boolean => {
    if (
      draftedTeamPlayers.value.some(
        draftedTeamPlayer => draftedTeamPlayer.selectedPlayer === null,
      )
    ) {
      addToast('error', 'Form errors', 'Please select all players before submitting team');
      return false;
    }

    if (isOverBudget.value) {
      addToast('error', 'Form errors', 'Your team is overbudget, please adjust your players');
      return false;
    }

    if (!turnstileToken.value) {
      addToast('error', 'Security Check Required', 'Please complete the security check before submitting');
      return false;
    }

    return true;
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    saveConfirmation: readonly(saveConfirmation),
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
