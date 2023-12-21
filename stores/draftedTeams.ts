import { defineStore } from 'pinia';
import { Database } from '@/types/database.types';
import { initDraftedTeamData } from '~/logic/drafted-teams';

export const useDraftedTeamsStore = defineStore('drafted-teams-store', () => {
  const supabase = useSupabaseClient<Database>();
  const draftedTeamsWithPlayersQuery = supabase.from('drafted_teams').select(`
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
  `);

  const draftedTeams: Ref<Array<any> | null> = ref(null);

  const getDraftedTeams = computed(() =>
    draftedTeams.value?.sort((a, b) =>
      a.team_name.toLowerCase().localeCompare(b.team_name.toLowerCase())
    )
  );

  const getDraftedTeamByID = computed(
    () => (id: number) =>
      draftedTeams.value.find((x) => x.drafted_team_id === id)
  );

  const fetchDraftedTeams = async () => {
    const { data, error } = await draftedTeamsWithPlayersQuery;
    if (error) throw error;
    draftedTeams.value = initDraftedTeamData(data);
  };

  const fetchDraftedPlayerByID = async (draftedPlayerID: string) => {
    const { data, error } = await supabase
      .from('drafted_players')
      .select(
        `*,
          transfers:drafted_transfers(*)
        )`
      )
      .eq('drafted_player_id', draftedPlayerID)
      .single();
    if (error) throw new Error(error.message);
    return data;
  };

  const upsertTeamData = (teamData: string) => {
    JSON.parse(teamData).map(async ({ team_players, ...draftedTeamData }) => {
      const formattedDraftedPlayers = team_players.map((x: any) => {
        return {
          drafted_player: x.player_id,
          drafted_team: draftedTeamData.drafted_team_id,
        };
      });
      await supabase.from('drafted_teams').upsert(draftedTeamData);
      await supabase.from('drafted_players').upsert(formattedDraftedPlayers);
    });
  };

  return {
    draftedTeams,
    getDraftedTeams,
    getDraftedTeamByID,
    fetchDraftedTeams,
    fetchDraftedPlayerByID,
    upsertTeamData,
  };
});
