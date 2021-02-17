/* eslint-disable camelcase */

import axios from 'axios'
import Players from 'static/players.json'
import Teams from 'static/teams.json'
import { initPlayerData } from '@/components/Players/CreatePlayerData'
import { Player } from '@/components/Players/Player'
import { PlayerPositionShort } from '@/components/Interfaces/PlayerPosition'
import { UPDATE_PLAYERS, GET_TEAMS, SET_USER } from './mutation-types'

interface User {
  name: string
  tokens: []
  role: string
}

interface State {
  players: any
  teams: any
  loading: boolean
  user: User
}

export const state = () => ({
  players: initPlayerData(Players),
  teams: Teams,
  loading: false,
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

  [UPDATE_PLAYERS](state: State, filterData: any) {
    state.players = initPlayerData(
      Players,
      filterData.filterName,
      filterData.filterPrice,
      filterData.filterTeam
    )
  },

  [GET_TEAMS](state: State, teams: any) {
    state.teams = teams
  },
}

export const actions = {
  async registerUser({ commit }: any, formData: any) {
    await axios
      .post('http://localhost:8080/v1/auth/register', formData)
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
      .post('http://localhost:8080/v1/auth/login', formData)
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
      .get('http://localhost:8080/v1/users', {
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

  logoutUser({ commit }: any) {
    commit('SET_USER', {})
    localStorage.removeItem('token')
    this.app.router.push('/account/login')
  },
}

export const getters = {
  getFilteredPlayerData: (state: State) => {
    return {
      goalkeepers: state.players.filteredPlayers.filter(
        (p: Player) => p.playerType === PlayerPositionShort.GK
      ),
      defenders: state.players.filteredPlayers.filter(
        (p: Player) => p.playerType === PlayerPositionShort.DEF
      ),
      midfielders: state.players.filteredPlayers.filter(
        (p: Player) => p.playerType === PlayerPositionShort.MID
      ),
      forwards: state.players.filteredPlayers.filter(
        (p: Player) => p.playerType === PlayerPositionShort.FWD
      ),
    }
  },
  getTeams: (state: State) => {
    return state.teams
  },

  getUser: (state: State) => {
    return state.user
  },

  isLoggedIn: (state: State) => !!state.user.tokens,
}
