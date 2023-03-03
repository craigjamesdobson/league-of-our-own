// stores/counter.js
import { getDocs } from "firebase/firestore";
import { defineStore } from "pinia";
import { draftedTeamsCollection } from "~~/firebase/useDB";
import { usePlayersStore } from "./players";
import { initDraftedTeamData } from "~~/modules/drafted-teams";

export const useDraftedTeamsStore = defineStore({
  id: "drafted-teams-store",
  state: () => {
    return {
      draftedTeams: [] as any,
    };
  },

  actions: {
    async fetchDraftedTeams() {
      const draftedTeamsDocRef = await getDocs(draftedTeamsCollection);
      const rawDraftedTeamsData = draftedTeamsDocRef.docs.map((team) =>
        team.data()
      );

      const playerStore = usePlayersStore();

      console.log(rawDraftedTeamsData);

      this.draftedTeams = initDraftedTeamData(
        playerStore.playerList,
        rawDraftedTeamsData
      );
    },
  },

  getters: {
    getDraftedTeams: (state) => state.draftedTeams,
  },
});
