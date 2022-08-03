import { defineStore } from 'pinia';
import { isEqual } from 'lodash-es';
import {
  doc,
  getDoc,
  getDocs,
  writeBatch,
  updateDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  firestore,
  playersCollection,
  settingsCollection,
} from '@/firebase/useDB';
import { Player } from '~~/modules/players/types/Player';
import { PlayerPosition } from '~~/modules/players/types/PlayerPosition';
import { createPlayerData } from '~~/modules/players';
import {
  localStorageGet,
  localStorageHas,
  localStorageSet,
} from '@/composables/localStorage';

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

      if (
        localStorageHas('updated-at') &&
        localStorageGet('updated-at') ===
          settingsDoc.data().updatedAt.toString()
      ) {
        this.players = localStorageGet('players');
        this.updatedAt = localStorageGet('updated-at');
      } else {
        const playerDocs = await getDocs(playersCollection);
        const players = playerDocs.docs.map((player) => player.data());

        this.players = createPlayerData(players);

        localStorageSet('updated-at', settingsDoc.data().updatedAt);
        localStorageSet('players', this.players);

        this.isLoaded = true;
      }
    },

    setSelectedPlayer(playerID: number) {
      this.selectedPlayer = this.players.filter((x) => x.id === playerID)[0];
    },

    async updatePlayerData(playerData) {
      const parsedData = JSON.parse(playerData);

      const updateLog = document.querySelector('.update-log');

      for (const newPlayerData of parsedData) {
        const playerDocRef = doc(
          playersCollection,
          newPlayerData.id.toString()
        );
        const playerDocSnap = await getDoc(playerDocRef);

        if (!playerDocSnap.exists()) {
          await setDoc(
            doc(playersCollection, newPlayerData.id.toString()),
            newPlayerData
          );
          updateLog.insertAdjacentHTML(
            'afterend',
            `<p style="color: green;">${newPlayerData.web_name} added</p>`
          );

          continue;
        }

        if (
          playerDocSnap.exists() &&
          isEqual(playerDocSnap.data(), newPlayerData)
        ) {
          updateLog.insertAdjacentHTML(
            'afterend',
            `<p style="color: gray;">${newPlayerData.web_name} has no changes</p>`
          );
        } else {
          await updateDoc(playerDocRef, newPlayerData);
          updateLog.insertAdjacentHTML(
            'afterend',
            `<p style="color: blue;">${newPlayerData.web_name} updated</p>`
          );
        }
      }
      const settingsDocRef = doc(settingsCollection, 'players');

      // Set the "capital" field of the city 'DC'
      await updateDoc(settingsDocRef, {
        updatedAt: Date.now(),
      });
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
