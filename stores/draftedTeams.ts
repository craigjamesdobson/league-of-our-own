// stores/counter.js
import { getDocs } from 'firebase/firestore';
import { defineStore } from 'pinia';
import { usePlayersStore } from './players';
import { draftedTeamsCollection } from '~~/firebase/useDB';
import { initDraftedTeamData } from '~~/modules/drafted-teams';
import { DraftedTeamData } from '~~/modules/drafted-teams/interfaces/DraftedTeamData';

export const useDraftedTeamsStore = defineStore({
  id: 'drafted-teams-store',
  state: () => {
    return {
      draftedTeams: [] as DraftedTeamData[]
    };
  },

  actions: {
    async fetchDraftedTeams () {
      const draftedTeamsDocRef = await getDocs(draftedTeamsCollection);
      const rawDraftedTeamsData = draftedTeamsDocRef.docs.map(team =>
        team.data()
      );

      const playerStore = usePlayersStore();

      this.draftedTeams = initDraftedTeamData(
        playerStore.playerList,
        rawDraftedTeamsData
      );
    }
  },

  getters: {
    getDraftedTeams: state => state.draftedTeams,
    getDraftedTeamsWithTransfers: state => state.draftedTeams.filter(x => x.allowedTransfers),
    getDraftedTeamByID: (state) => {
      return (draftedTeamID: number) =>
        state.draftedTeams.filter(draftedTeam => draftedTeam.teamID === +draftedTeamID)[0];
    },
  }
});
