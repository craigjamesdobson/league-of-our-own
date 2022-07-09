import { defineStore } from 'pinia';
import { doc, onSnapshot } from 'firebase/firestore';
import { playersCollection } from '~~/firebase/useDB';

export const usePlayersStore = defineStore({
  id: 'filter-store',
  state: () => {
    return {
      players: [],
    };
  },
  actions: {
    async fetchPlayerData() {
      return onSnapshot(playersCollection, (snap) => {
        const players = snap.docs.map((x) => x.data());
        this.players = players;
      });
    },
  },
  getters: {
    playerList: (state) => state.players,
  },
});
