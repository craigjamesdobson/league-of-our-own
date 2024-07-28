import { defineStore } from 'pinia';
import { initDraftedTeamData } from '~/logic/drafted-teams';
import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type {
  DraftedTeam,
  DraftedTeamWithWeeklyStats
} from '~/types/DraftedTeam';
import type { Database } from '~/types/database.types';

export const useDraftedTeamsStore = defineStore('drafted-teams-store', () => {
  const supabase = useSupabaseClient<Database>();
  const config = useRuntimeConfig();

  const draftedTeams: Ref<Array<DraftedTeam> | null> = ref(null);

  const getDraftedTeams = computed(() =>
    initDraftedTeamData(draftedTeams.value)
  );

  const getDraftedTeamByID = computed(() => {
    const draftedTeamsValue = getDraftedTeams.value;

    return (id: number) =>
      draftedTeamsValue?.find((x) => x.drafted_team_id === id);
  });

  const fetchDraftedTeams = async () => {
    const { data, error } = await supabase
      .rpc('get_drafted_teams_by_season', { active_season_param: config.public.ACTIVE_SEASON })
      .returns<DraftedTeam[]>();
    if (error) throw error;
    draftedTeams.value = data;
  };

  const fetchDraftedTeamsWithPlayerPointsByGameweek = async (
    selectedGameWeek: number
  ) => {
    const { data, error } = await supabase
      .rpc('get_drafted_teams_with_player_points_by_gameweek', {
        game_week_param: selectedGameWeek
      })
      .returns<DraftedTeamWithWeeklyStats[]>();
    if (error) throw error;
    return data;
  };

  const fetchDraftedPlayerByID = async (draftedPlayerID: string) => {
    const { data, error } = await supabase
      .from('drafted_players')
      .select(
        `*,
          transfers:drafted_transfers(*)
        `
      )
      .eq('drafted_player_id', draftedPlayerID)
      .single();
    if (error) throw new Error(error.message);
    return data;
  };

  const upsertTeamData = (teamData: string) => {
    const parsedDraftedTeams: DraftedTeam[] = JSON.parse(teamData);
    parsedDraftedTeams.map(async ({ players, ...draftedTeamData }) => {
      const formattedDraftedPlayers = players.map((x: DraftedPlayer) => {
        return {
          drafted_player: x.data.player_id,
          drafted_team: draftedTeamData.drafted_team_id
        };
      });
      await supabase.from('drafted_teams').upsert(draftedTeamData);
      await supabase.from('drafted_players').upsert(formattedDraftedPlayers);
    });
  };

  const addNewTransfer = async (
    newTransferData: Array<{
      drafted_player: number;
      player_id: number;
      transfer_week: number;
      active_transfer_expiry: string;
    }>
  ) => {
    const { data, error } = await supabase
      .from('drafted_transfers')
      .insert(newTransferData)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const deleteTransfer = async (draftedTransferID: number) => {
    const { error } = await supabase
      .from('drafted_transfers')
      .delete()
      .eq('drafted_transfer_id', draftedTransferID);

    if (error) {
      throw new Error(error.message);
    }
  };

  return {
    draftedTeams,
    getDraftedTeams,
    getDraftedTeamByID,
    fetchDraftedTeams,
    fetchDraftedPlayerByID,
    fetchDraftedTeamsWithPlayerPointsByGameweek,
    upsertTeamData,
    addNewTransfer,
    deleteTransfer
  };
});
