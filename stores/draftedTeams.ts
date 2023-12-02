import { getDocs } from 'firebase/firestore';
import { defineStore } from 'pinia';
import { initDraftedTeamData } from '../logic/drafted-teams';
import { DraftedTeamData } from '../logic/drafted-teams/interfaces/DraftedTeamData';
import { draftedTeamsCollection } from '../firebase/useDB';
import { usePlayersStore } from './players';

export const useDraftedTeamsStore = defineStore({
  id: 'drafted-teams-store',
  state: () => {
    return {
      draftedTeams: [] as DraftedTeamData[],
    };
  },

  actions: {
    async fetchDraftedTeams() {
      const supabase = useSupabaseClient();

      const { data, error } = await supabase
        .from('drafted_teams_view')
        .select();

      console.log(data);

      const teamsDocs = await getDocs(draftedTeamsCollection);
      const playerStore = usePlayersStore();
      const draftedTeams = teamsDocs.docs.map((team) => team.data());

      this.draftedTeams = initDraftedTeamData(
        playerStore.playerList,
        draftedTeams
      );
    },
  },

  getters: {
    getDraftedTeams: (state) =>
      state.draftedTeams.sort((a, b) =>
        a.teamName.toLowerCase().localeCompare(b.teamName.toLowerCase())
      ),
    getDraftedTeamsWithTransfers: (state) =>
      state.draftedTeams.filter((x) => x.allowedTransfers),
    getDraftedTeamByID: (state) => {
      return (draftedTeamID: number) =>
        state.draftedTeams.filter(
          (draftedTeam) => draftedTeam.teamID === +draftedTeamID
        )[0];
    },
  },
});
