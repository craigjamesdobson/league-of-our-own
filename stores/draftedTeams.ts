import { defineStore } from 'pinia';
import { initDraftedTeamData } from '~/logic/drafted-teams';
import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type { DraftedTeam } from '~/types/DraftedTeam';
import type { Database } from '~/types/database.types';

export const useDraftedTeamsStore = defineStore('drafted-teams-store', () => {
  const supabase = useSupabaseClient<Database>();
  const draftedTeamsWithPlayersQuery = supabase
    .from('drafted_teams')
    .select(
      `
  *,
  players:drafted_players(
    drafted_player_id,
    drafted_team,
    ...players_view(*),
    transfers:drafted_transfers(
        drafted_transfer_id,
        transfer_week, 
        active_transfer_expiry,
        player:players_view(*)
      )
    )
  `
    )
    .order('team_name', { ascending: true });

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
    const { data, error } = await draftedTeamsWithPlayersQuery;
    if (error) throw error;
    draftedTeams.value = data;
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
          drafted_player: x.player_id,
          drafted_team: draftedTeamData.drafted_team_id,
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
    upsertTeamData,
    addNewTransfer,
    deleteTransfer,
  };
});
