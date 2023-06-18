import { defineStore } from 'pinia';
import { isEqual } from 'lodash-es';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useDocument, useFirestore } from 'vuefire';
import type { Player } from '../modules/players/interfaces/Player';
import { PlayerPosition } from '../modules/players/interfaces/PlayerPosition';
import { createPlayerData } from '../modules/players';
import {
  localStorageGet,
  localStorageHas,
  localStorageSet,
} from '../composables/localStorage';
import { RawPlayerData } from '../modules/players/interfaces/RawPlayerData';

interface FilterData {
  filterName: string;
  filterPrice: string;
  filterTeam: number | undefined;
}

interface State {
  players: Player[];
  filteredPlayers: Player[];
  selectedPlayer: Player;
  updatedAt: string;
  isLoaded: boolean;
}

interface SettingsData {
  updatedAt: string;
}

export const usePlayersStore = defineStore({
  id: 'player-store',
  state: (): State => {
    return {
      players: [],
      filteredPlayers: [],
      selectedPlayer: {} as Player,
      updatedAt: '',
      isLoaded: false,
    };
  },
  actions: {
    async getPlayerSettings() {
      const db = useFirestore();
      const { data: settingsData, promise: settingsLoaded } =
        useDocument<SettingsData>(
          doc(db, 'season', '2022-2023', 'settings', 'players')
        );

      await settingsLoaded.value;

      if (!settingsData.value) {
        return;
      }

      if (
        localStorageHas('updated-at') &&
        localStorageGet('updated-at') ===
          settingsData.value.updatedAt.toString()
      ) {
        this.players = localStorageGet('players') as Player[];
        this.filteredPlayers = this.players;
        this.updatedAt = localStorageGet('updated-at') as string;
      } else {
        const playerDocs = await useCollection<RawPlayerData>(
          collection(db, 'season', '2022-2023', 'players')
        ).promise.value;

        this.players = createPlayerData(playerDocs);
        this.filteredPlayers = this.players;

        localStorageSet('updated-at', settingsDoc.updatedAt);
        localStorageSet('players', this.players);

        this.isLoaded = true;
      }
    },

    setSelectedPlayer(playerID: number) {
      this.selectedPlayer = this.players.filter((x) => x.id === playerID)[0];
    },

    async updatePlayerData(playerData: string) {
      const parsedData = JSON.parse(playerData);

      const updateLog = document.querySelector('.update-log');

      if (!updateLog) {
        throw new Error('No log element');
      }

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

      await updateDoc(settingsDocRef, {
        updatedAt: Date.now(),
      });
    },

    async updateTeamData(teamData: string) {
      const parsedData = JSON.parse(teamData);

      const updateLog = document.querySelector('.update-log');

      if (!updateLog) {
        throw new Error('No log element');
      }

      for (const newTeamData of parsedData) {
        const teamDocRef = doc(
          draftedTeamsCollection,
          newTeamData.team_id.toString()
        );
        const teamDocSnap = await getDoc(teamDocRef);

        if (!teamDocSnap.exists()) {
          await setDoc(
            doc(draftedTeamsCollection, newTeamData.team_id.toString()),
            newTeamData
          );

          updateLog.insertAdjacentHTML(
            'afterend',
            `<p style="color: green;">${newTeamData.team_name} added</p>`
          );
        }
      }
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

    getFilteredPlayers:
      (state) =>
      ({ filterName, filterPrice, filterTeam }: FilterData) => {
        let filteredPlayers = state.players;
        if (filterName) {
          filteredPlayers = filteredPlayers.filter((p) =>
            p.webName
              .normalize('NFD')
              .replace(/[\u0300-\u036F]/g, '')
              .toLowerCase()
              .includes(filterName.toLowerCase())
          );
        }

        if (filterPrice) {
          filteredPlayers = filteredPlayers.filter((player) =>
            player.price.includes(filterPrice)
          );
        }

        if (filterTeam) {
          filteredPlayers = filteredPlayers.filter(
            (p) => p.team === filterTeam
          );
        }
        state.filteredPlayers = filteredPlayers;
      },

    getFilteredPlayersByPosition: (state) => {
      return {
        goalkeepers: state.filteredPlayers
          .filter((x) => x.position === PlayerPosition.GOALKEEPER)
          .sort((a, b) => a.team - b.team),
        defenders: state.filteredPlayers
          .filter((x) => x.position === PlayerPosition.DEFENDER)
          .sort((a, b) => a.team - b.team),
        midfielders: state.filteredPlayers
          .filter((x) => x.position === PlayerPosition.MIDFIELDER)
          .sort((a, b) => a.team - b.team),
        forwards: state.filteredPlayers
          .filter((x) => x.position === PlayerPosition.FORWARD)
          .sort((a, b) => a.team - b.team),
      };
    },
  },
});
