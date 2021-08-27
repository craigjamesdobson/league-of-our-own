/* eslint-disable camelcase */

import axios from '@/plugins/axios'
import Teams from 'static/teams.json'
import {
  initPlayerData,
  getFilteredPlayers,
} from '@/components/Players/CreatePlayerData'
import { Player } from '@/components/Players/Player'
import { PlayerPositionShort } from '@/components/Interfaces/PlayerPosition'
import {
  FILTER_PLAYERS,
  FETCH_PLAYERS,
  FETCH_FIXTURES,
  UPDATE_FIXTURESCORE,
  STORE_PLAYERSTATS,
  GET_TEAMS,
  SET_USER,
  SET_LOAD,
} from './mutation-types'
import { initFixturesData } from '~/components/Fixtures/CompleteFixtures'

interface User {
  name: string
  tokens: []
  role: string
}

interface State {
  playerData: any
  draftedTeamData: any
  teams: any
  fixtures: any
  loading: boolean
  user: User
}

export const state = () => ({
  playerData: {
    players: {
      players: [],
    },
    filteredPlayers: {
      players: [],
    },
  },
  draftedTeamData: {},
  teams: Teams,
  fixtures: {},
  loading: true,
  user: {
    name: '',
    tokens: localStorage.getItem('token') || '',
    role: '',
  },
})

export const mutations = {
  [SET_USER](state: State, data: any) {
    state.user = data
  },

  [SET_LOAD](state: State, isLoading: boolean) {
    state.loading = isLoading
  },

  [FILTER_PLAYERS](state: State, filterData: any) {
    state.playerData.filteredPlayers.players = getFilteredPlayers(
      state.playerData.players.players,
      filterData.filterName,
      filterData.filterPrice,
      filterData.filterTeam
    )
  },

  [FETCH_PLAYERS](state: State, playerData: any) {
    state.playerData = initPlayerData(playerData.players)
  },

  [GET_TEAMS](state: State, teams: any) {
    state.teams = teams
  },
}

export const actions = {
  async registerUser({ commit }: any, formData: any) {
    await axios
      .post('/v1/auth/register', formData)
      .then((res) => {
        commit('SET_USER', res.data.user)
        localStorage.setItem('token', res.data.token)
        axios.defaults.headers.common.Authorization = res.data.token
        this.app.router.push('/account')
      })
      .catch((err) => {
        throw err.response.data
      })
  },

  async loginUser({ commit }: any, formData: any) {
    await axios
      .post('/v1/auth/login', formData)
      .then((res) => {
        commit('SET_USER', res.data.user)
        localStorage.setItem('token', res.data.token)
        axios.defaults.headers.common.Authorization = res.data.token
        this.app.router.push('/account')
      })
      .catch((err) => {
        throw err.response.data
      })
  },

  async fetchUser({ commit, state }: any) {
    await axios
      .get('/v1/users', {
        headers: { Authorization: `Bearer ${state.user.tokens}` },
      })
      .then((res) => {
        commit('SET_USER', res.data)
        localStorage.setItem('token', res.data.tokens[0].token)
        axios.defaults.headers.common.Authorization = res.data.tokens[0].token
      })
      .catch((err) => {
        localStorage.removeItem('token')
        commit('SET_USER', {})
        this.app.router.push('/account/login')
        throw err.response.data
      })
  },

  async fetchPlayers({ commit, dispatch, state }: any) {
    await axios
      .get('/v1/players')
      .then((res) => {
        commit('FETCH_PLAYERS', res.data)
        commit('SET_LOAD', false)
        dispatch('drafted-data/fetchDraftedTeams', state.playerData)
      })
      .catch((err) => {
        commit('SET_LOAD', false)
        throw err.response.data
      })
  },

  logoutUser({ commit }: any) {
    commit('SET_USER', {})
    localStorage.removeItem('token')
    this.app.router.push('/account/login')
  },
}

export const getters = {
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

  getTeams: (state: State) => {
    return state.teams
  },

  getDraftedTeams: (state: State) => {
    return state.draftedTeamData
  },

  getUser: (state: State) => {
    return state.user
  },

  isLoggedIn: (state: State) => !!state.user.tokens,

  isLoading: (state: State) => state.loading,
}
