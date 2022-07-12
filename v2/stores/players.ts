import { defineStore } from 'pinia';
import { onSnapshot } from 'firebase/firestore';
import { playersCollection } from '@/firebase/useDB';
import { Player } from '~~/modules/players/types/Player';
import { PlayerPosition } from '~~/modules/players/types/PlayerPosition';
import { createPlayerData } from '~~/modules/players';

interface State {
  players: Player[];
}

export const usePlayersStore = defineStore({
  id: 'player-store',
  state: (): State => {
    return {
      players: [],
    };
  },
  actions: {
    async fetchPlayerData() {
      return onSnapshot(playersCollection, (snap) => {
        const players = snap.docs.map((x) => x.data());
        this.players = createPlayerData(players);
      });
    },
  },
  getters: {
    playerList: (state) => state.players,

    getFilteredPlayers: (state) => {
      return {
        goalkeepers: state.players
          .filter((x) => x.position === PlayerPosition.GOALKEEPER)
          .sort((a, b) => a.team - b.team),
        defenders: state.players
          .filter((x) => x.position === PlayerPosition.DEFENDER)
          .sort((a, b) => a.team - b.team),
        midfielders: state.players
          .filter((x) => x.position === PlayerPosition.MIDFIELDER)
          .sort((a, b) => a.team - b.team),
        forwards: state.players
          .filter((x) => x.position === PlayerPosition.FORWARD)
          .sort((a, b) => a.team - b.team),
      };
    },
  },
});
