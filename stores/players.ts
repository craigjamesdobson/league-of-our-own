import { defineStore } from 'pinia';
import type { Player } from '../logic/players/interfaces/Player';
import { PlayerPosition } from '../logic/players/interfaces/PlayerPosition';

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
      const supabase = useSupabaseClient();

      try {
        const { data, error } = await supabase.from('players_view').select(`*`);

        if (error) {
          console.error('Error fetching data:', error.message);
          return;
        }
        this.players = data;
        this.filteredPlayers = this.players;
        this.isLoaded = true;
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'message' in error) {
          console.error('Error:', (error as Error).message);
        } else {
          console.error('An unknown error occurred.');
        }
      }
    },

    setSelectedPlayer(playerID: number) {
      this.selectedPlayer = this.players.filter(
        (x) => x.player_id === playerID
      )[0];
    },

    // async updatePlayerData(playerData: string) {
    //   const parsedData = JSON.parse(playerData);

    //   const updateLog = document.querySelector('.update-log');

    //   if (!updateLog) {
    //     throw new Error('No log element');
    //   }

    //   const supabase = useSupabaseClient();

    //   const { data, error } = await supabase
    //     .from('players')
    //     .upsert(parsedData)
    //     .select();

    //   if (error) {
    //     console.error('Error fetching data:', error.message);
    //   } else {
    //     console.log('Data:', data);
    //   }
    // },

    // async updateTeamData(teamData: string) {
    //   const parsedData = JSON.parse(teamData);

    //   const updateLog = document.querySelector('.update-log');

    //   if (!updateLog) {
    //     throw new Error('No log element');
    //   }

    //   for (const newTeamData of parsedData) {
    //     const teamDocRef = doc(
    //       draftedTeamsCollection,
    //       newTeamData.team_id.toString()
    //     );
    //     const teamDocSnap = await getDoc(teamDocRef);

    //     if (!teamDocSnap.exists()) {
    //       await setDoc(
    //         doc(draftedTeamsCollection, newTeamData.team_id.toString()),
    //         newTeamData
    //       );

    //       updateLog.insertAdjacentHTML(
    //         'afterend',
    //         `<p style="color: green;">${newTeamData.team_name} added</p>`
    //       );
    //     } else {
    //       await updateDoc(teamDocRef, newTeamData);
    //       updateLog.insertAdjacentHTML(
    //         'afterend',
    //         `<p style="color: blue;">${newTeamData.team_name} updated</p>`
    //       );
    //     }
    //   }
    // },
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
            p.web_name
              .normalize('NFD')
              .replace(/[\u0300-\u036F]/g, '')
              .toLowerCase()
              .includes(filterName.toLowerCase())
          );
        }

        if (filterPrice) {
          filteredPlayers = filteredPlayers.filter((player) =>
            player.cost.includes(filterPrice)
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
