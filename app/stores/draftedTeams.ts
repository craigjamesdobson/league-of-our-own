import { defineStore } from 'pinia';
import { initDraftedTeamData } from '~/logic/drafted-teams';
import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type {
  DraftedTeamWithPlayers,
} from '~/types/DraftedTeam';
import type { Database, TablesInsert } from '~/types/database.types';

export const useDraftedTeamsStore = defineStore('drafted-teams-store', () => {
  const supabase = useSupabaseClient<Database>();
  const config = useRuntimeConfig();

  const draftedTeams: Ref<DraftedTeamWithPlayers[] | null> = ref(null);

  const getDraftedTeams = computed(() =>
    initDraftedTeamData(draftedTeams.value),
  );

  const getDraftedTeamByID = computed(() => {
    const draftedTeamsValue = getDraftedTeams.value;

    return (id: number) =>
      draftedTeamsValue?.find(x => x.drafted_team_id === id);
  });

  const fetchDraftedTeams = async () => {
    const { data, error } = await supabase
      .rpc('get_drafted_teams_by_season', { active_season_param: config.public.ACTIVE_SEASON });
    if (error) throw error;
    draftedTeams.value = data;
  };

  const fetchDraftedTeamsWithPlayerPointsByGameweek = async (
    selectedGameWeek: number,
  ) => {
    const { data, error } = await supabase
      .rpc('get_drafted_teams_with_player_points_by_gameweek', {
        game_week_param: selectedGameWeek,
        active_season_param: config.public.ACTIVE_SEASON,
      });
    if (error) throw error;
    return data;
  };

  const fetchDraftedPlayerByID = async (draftedPlayerID: number) => {
    const { data, error } = await supabase
      .from('drafted_players')
      .select(
        `*,
          transfers:drafted_transfers(*)
        `,
      )
      .eq('drafted_player_id', draftedPlayerID)
      .single();
    if (error) throw new Error(error.message);
    return data;
  };

  const upsertDraftedTeam = async (draftedTeamData: TablesInsert<'drafted_teams'>) => {
    const { data, error } = await supabase
      .from('drafted_teams')
      .upsert(draftedTeamData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  };

  const upsertDraftedPlayers = async (draftedPlayersData: TablesInsert<'drafted_players'>[]) => {
    const { data, error } = await supabase
      .from('drafted_players')
      .upsert(draftedPlayersData)
      .select();

    if (error) throw new Error(error.message);
    return data;
  };

  const bulkUpsertDraftedTeams = (teamData: string) => {
    const parsedDraftedTeams: DraftedTeamWithPlayers[] = JSON.parse(teamData);
    parsedDraftedTeams.map(async (team) => {
      const { players, ...draftedTeamData } = team;
      const formattedDraftedPlayers = players.map((x: DraftedPlayer) => {
        return {
          drafted_player: x.data.player_id,
          drafted_team: draftedTeamData.drafted_team_id,
        };
      });
      await supabase.from('drafted_teams').upsert({
        drafted_team_id: draftedTeamData.drafted_team_id,
        team_name: draftedTeamData.team_name,
        team_owner: draftedTeamData.team_owner,
        team_email: draftedTeamData.team_email,
        allowed_transfers: draftedTeamData.allowed_transfers,
        total_team_value: draftedTeamData.total_team_value ?? 0,
        is_invalid_team: draftedTeamData.is_invalid_team ?? false,
        active_season: config.public.ACTIVE_SEASON,
      });
      await supabase.from('drafted_players').upsert(formattedDraftedPlayers);
    });
  };

  const addNewTransfer = async (
    newTransferData: Array<{
      drafted_player: number;
      player_id: number;
      transfer_week: number;
      active_transfer_expiry: string;
    }>,
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
    upsertDraftedTeam,
    upsertDraftedPlayers,
    bulkUpsertDraftedTeams,
    addNewTransfer,
    deleteTransfer,
  };
});
