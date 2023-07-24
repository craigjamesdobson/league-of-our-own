// stores/counter.js
import { getDocs } from 'firebase/firestore';
import { defineStore } from 'pinia';
import { initDraftedTeamData } from '../modules/drafted-teams';
import { DraftedTeamData } from '../modules/drafted-teams/interfaces/DraftedTeamData';
import { usePlayersStore } from './players';
import { draftedTeamsCollection } from '~~/firebase/useDB';
import { RawDraftedTeamData } from '~~/modules/drafted-teams/interfaces/RawDraftedTeamData';

export const useDraftedTeamsStore = defineStore({
  id: 'drafted-teams-store',
  state: () => {
    return {
      rawDraftedTeams: [] as RawDraftedTeamData[],
      draftedTeams: [] as DraftedTeamData[],
    };
  },

  actions: {
    async fetchDraftedTeams() {
      const teamsDocs = await getDocs(draftedTeamsCollection);
      const playerStore = usePlayersStore();
      const draftedTeams = teamsDocs.docs.map((team) => team.data());

      this.rawDraftedTeams = draftedTeams;

      this.draftedTeams = initDraftedTeamData(
        playerStore.playerList,
        draftedTeams
      );
    },
  },

  getters: {
    getRawDraftedTeams: (state) => state.rawDraftedTeams,
    getDraftedTeams: (state) => state.draftedTeams,
    getDraftedTeamsWithTransfers: (state) =>
      state.draftedTeams.filter((x) => x.allowedTransfers),
    getDraftedTeamByID: (state) => {
      return (draftedTeamID: number) =>
        state.rawDraftedTeams.filter(
          (draftedTeam) => draftedTeam.team_id === +draftedTeamID
        )[0];
    },
  },
});
