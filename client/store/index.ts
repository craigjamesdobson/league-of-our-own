/* eslint-disable camelcase */

import axios from 'axios'
import Players from 'static/players.json'
import Teams from 'static/teams.json'
import { initPlayerData } from '@/components/Players/CreatePlayerData'
import { Player } from '@/components/Players/Player'
import { PlayerPositionShort } from '@/components/Interfaces/PlayerPosition'
import { UPDATE_PLAYERS, GET_TEAMS, REGISTER_USER } from './mutation-types'

interface State {
  players: any
  teams: any
  loading: boolean
  user: {}
}

export const state = () => ({
  players: initPlayerData(Players),
  teams: Teams,
  loading: false,
  user: {
    name: '',
    token: localStorage.getItem('token') || '',
    role: '',
  },
})

export const mutations = {
  [REGISTER_USER](state: State, data: any) {
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
        commit('REGISTER_USER', res.data.user)
        localStorage.setItem('token', res.data.token)
        this.app.router.push('/players')
      })
      .catch((err) => {
        throw err.response.data
      })
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
}
