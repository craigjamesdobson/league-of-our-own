import { defineStore } from 'pinia';
import { Database } from '@/types/database.types';

export const useDraftedTeamsStore = defineStore('drafted-teams-store', () => {
  const supabase = useSupabaseClient<Database>();
  const draftedTeamsWithPlayersQuery = supabase.from('drafted_teams_summary')
    .select(`
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

  const fetchDraftedTeams = async () => {
    const { data, error } = await draftedTeamsWithPlayersQuery;
    if (error) throw error;
    console.log(data);
    draftedTeams.value = data;
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

  return { draftedTeams, getDraftedTeams, fetchDraftedTeams, upsertTeamData };
});

// export const useDraftedTeamsStore = defineStore({
//   id: 'drafted-teams-store',
//   state: () => {
//     return {
//       draftedTeams: null,
//     };
//   },

//   actions: {
//     async fetchDraftedTeams() {
//       const { data, error } = await draftedTeamsWithPlayers;
//       if (error) throw error;
//       console.log(data);
//       this.draftedTeams = data;
//     },
//   },

//   getters: {
//     getDraftedTeams: (state) =>
//       state.draftedTeams.sort((a, b) =>
//         a.teamName.toLowerCase().localeCompare(b.teamName.toLowerCase())
//       ),
//     getDraftedTeamsWithTransfers: (state) =>
//       state.draftedTeams.filter((x) => x.allowedTransfers),
//     getDraftedTeamByID: (state) => {
//       return (draftedTeamID: number) =>
//         state.draftedTeams.filter(
//           (draftedTeam) => draftedTeam.teamID === +draftedTeamID
//         )[0];
//     },
//   },
// });
