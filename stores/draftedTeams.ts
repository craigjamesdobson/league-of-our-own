// stores/counter.js
import { collection } from 'firebase/firestore';
import { defineStore } from 'pinia';
import { useCollection, useFirestore } from 'vuefire';
import { initDraftedTeamData } from '../modules/drafted-teams';
import { DraftedTeamData } from '../modules/drafted-teams/interfaces/DraftedTeamData';
import { usePlayersStore } from './players';
import { RawDraftedTeamData } from '~~/modules/drafted-teams/interfaces/RawDraftedTeamData';

export const useDraftedTeamsStore = defineStore({
  id: 'drafted-teams-store',
  state: () => {
    return {
      draftedTeams: [] as DraftedTeamData[],
    };
  },

  actions: {
    async fetchDraftedTeams() {
      const db = useFirestore();
      const draftedTeamsDocRef = await useCollection<RawDraftedTeamData>(
        collection(db, 'season', '2022-2023', 'drafted-teams')
      ).promise.value;

      const playerStore = usePlayersStore();

      this.draftedTeams = initDraftedTeamData(
        playerStore.playerList,
        draftedTeamsDocRef
      );
    },
  },

  getters: {
    getDraftedTeams: (state) => state.draftedTeams,
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
