import { defineStore } from 'pinia';
import { onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { playersCollection, settingsCollection } from '@/firebase/useDB';
import { Player } from '~~/modules/players/types/Player';
import { PlayerPosition } from '~~/modules/players/types/PlayerPosition';
import { createPlayerData } from '~~/modules/players';

interface State {
  players: Player[];
  selectedPlayer: Player;
  updatedAt: string;
  isLoaded: boolean;
}

export const usePlayersStore = defineStore({
  id: 'player-store',
  state: (): State => {
    return {
      players: [] as Player[],
      selectedPlayer: {} as Player,
      updatedAt: null,
      isLoaded: false,
    };
  },
  actions: {
    async getPlayerSettings() {
      const settingsDocRef = doc(settingsCollection, 'players');
      const settingsDoc = await getDoc(settingsDocRef);
      const updatedTime = settingsDoc.data();
      console.log(updatedTime);

      const updatedat = localStorage.getItem('updated-at');

      if (updatedat && updatedat === settingsDoc.data().updatedAt) {
        this.players = JSON.parse(localStorage.getItem('players'));
        this.updatedAt = updatedat;
      } else {
        const playerDocs = await getDocs(playersCollection);
        const players = [];
        const playerData = playerDocs.docs.forEach((player) =>
          players.push(player.data())
        );
        this.players = createPlayerData(players);
        this.isLoaded = true;
        localStorage.setItem('updated-at', settingsDoc.data().updatedAt);
        localStorage.setItem('players', JSON.stringify(this.players));
      }
    },

    setSelectedPlayer(playerID: number) {
      this.selectedPlayer = this.players.filter((x) => x.id === playerID)[0];
    },
  },
  getters: {
    playerList: (state) => state.players,

    getPlayerByID: (state) => {
      return (playerID: number) =>
        state.players.filter((player) => player.id === +playerID)[0];
    },

    getSelectedPlayer: (state) => state.selectedPlayer,

    getPlayersUpdatedDate: (state) => new Date(+state.updatedAt).toDateString(),

    stateIsLoaded: (state) => state.isLoaded,

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
