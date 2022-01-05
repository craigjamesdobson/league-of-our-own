import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import Teams from 'static/teams.json'
import initPlayerData, {
  getFilteredPlayers,
} from '@/components/Players/CreatePlayerData'

import Player from '@/components/Players/Player'
import { PlayerPositionShort } from '@/components/Interfaces/PlayerPosition'

interface User {
  name: string
  tokens: string
  role: string
}

interface State {
  playerData: any
  draftedTeamData: any
  teams: any
  loading: boolean
  user: User
}

export const useStore = defineStore('storeId', {
  // arrow function recommended for full type inference
  state: (): State => {
    return {
      playerData: {
        // TODO: Figure out why the state is players.players...
        players: {
          players: [],
        },
        filteredPlayers: {
          players: [],
        },
      },
      draftedTeamData: {},
      teams: Teams,
      loading: true,
      user: {
        name: '',
        tokens: localStorage.getItem('token') || '',
        role: '',
      },
    }
  },
  actions: {
    async registerUser(formData: any) {
      await axios
        .post('/v1/auth/register', formData)
        .then((res) => {
          this.user = res.data.user
          localStorage.setItem('token', res.data.token)
          axios.defaults.headers.common.Authorization = res.data.token
          this.app.router.push('/account')
        })
        .catch((err) => {
          throw err.response.data
        })
    },

    async loginUser(formData: any) {
      await axios
        .post('/v1/auth/login', formData)
        .then((res) => {
          this.user = res.data.user
          localStorage.setItem('token', res.data.token)
          axios.defaults.headers.common.Authorization = res.data.token
          this.app.router.push('/account')
        })
        .catch((err) => {
          throw err.response.data
        })
    },

    async fetchUser() {
      await axios
        .get('/v1/users', {
          headers: { Authorization: `Bearer ${this.user.tokens}` },
        })
        .then((res) => {
          this.user = res.data
          localStorage.setItem('token', res.data.tokens[0].token)
          axios.defaults.headers.common.Authorization = res.data.tokens[0].token
        })
        .catch((err) => {
          localStorage.removeItem('token')
          this.user = {}
          this.app.router.push('/account/login')
          throw err.response.data
        })
    },

    async fetchPlayers() {
      return await axios
        .get('/v1/players')
        .then((res) => {
          this.playerData = initPlayerData(res.data.players)
          this.loading = false
          // dispatch('drafted-data/fetchDraftedTeams', state.playerData)
        })
        .catch((err) => {
          this.loading = false
          throw err.response.data
        })
    },

    filterPlayers({ commit }: any, playerData) {
      commit('FILTER_PLAYERS', playerData)
    },

    updatePlayers({ commit }: any, playerData) {
      commit('UPDATE_PLAYERS', playerData)
    },

    logoutUser({ commit }: any) {
      commit('SET_USER', {})
      localStorage.removeItem('token')
      this.app.router.push('/account/login')
    },
  },

  getters: {
    getPlayerData: (state: State) => {
      return state.playerData
    },

    getFilteredPlayerData: (state: State) => {
      return {
        goalkeepers: state.playerData.filteredPlayers.players.filter(
          (p: Player) => p.playerType === PlayerPositionShort.GK
        ),
        defenders: state.playerData.filteredPlayers.players.filter(
          (p: Player) => p.playerType === PlayerPositionShort.DEF
        ),
        midfielders: state.playerData.filteredPlayers.players.filter(
          (p: Player) => p.playerType === PlayerPositionShort.MID
        ),
        forwards: state.playerData.filteredPlayers.players.filter(
          (p: Player) => p.playerType === PlayerPositionShort.FWD
        ),
      }
    },

    getSortedPlayerStat: (state: State) => (stat, amountToReturn: number) => {
      return [...state.playerData.players.players]
        .sort((a: Player, b: Player) => b[stat] - a[stat])
        .slice(0, amountToReturn)
    },

    getTeams: (state: State) => {
      return state.teams
    },

    getUser: (state: State) => {
      return state.user
    },

    isLoggedIn: (state: State) => !!state.user.tokens,

    isLoading: (state: State) => state.loading,
  },
})
