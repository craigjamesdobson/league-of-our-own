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

  [FETCH_FIXTURES](state: State, fixtures: any) {
    state.fixtures = initFixturesData(fixtures)
  },

  [UPDATE_FIXTURESCORE](state: State, formData: any) {
    const selectedWeek = state.fixtures.filter(
      (x) => x.week === formData.activeWeek.toString()
    )

    const selectedFixture = selectedWeek[0].fixtures.filter(
      (x) => x.id === formData.selectedFixtureID
    )

    selectedFixture[0].score = formData.score
  },

  [STORE_PLAYERSTATS](state: State, formData: any) {
    const selectedWeek = state.fixtures.filter(
      (x) => x.week === formData.activeWeek.toString()
    )

    const selectedFixture = selectedWeek[0].fixtures.filter(
      (x) => x.id === formData.activeFixture
    )

    const activePlayerStats = selectedFixture[0][
      formData.activeVenue
    ].stats.filter((x) => x.playerID === formData.stats.playerID)
    if (activePlayerStats.length) {
      const currentStatType = formData.stats.statType
      activePlayerStats[0][currentStatType] = formData.stats.playerStat
    } else {
      selectedFixture[0][formData.activeVenue].stats.push({
        playerID: formData.stats.playerID,
        [formData.stats.statType]: formData.stats.playerStat,
      })
    }
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

  async fetchFixtures({ commit }: any) {
    await axios
      .get('/v1/fixtures')
      .then((res) => {
        commit('FETCH_FIXTURES', res.data.fixtures)
      })
      .catch((err) => {
        throw err.response.data
      })
  },

  async updateFixtureScore({ commit }: any, formData: any) {
    await commit('UPDATE_FIXTURESCORE', formData)
  },

  async storePlayerStats({ commit }: any, formData: any) {
    await commit('STORE_PLAYERSTATS', formData)
  },

  async updateFixtureCollection({ state }: any, activeWeek: any) {
    const selectedWeek = state.fixtures.filter(
      (x) => x.week === activeWeek.toString()
    )

    const button: HTMLButtonElement = document.querySelector(
      '.js-update-fixture-collection-btn'
    )

    button.innerHTML = 'Saving Week...'

    await axios
      .post('/v1/fixtures/update', ...selectedWeek)
      .then((res) => {
        setTimeout(() => {
          button.innerHTML = 'Save Week'
        }, 1000)
      })
      .catch((err) => {
        button.innerHTML = 'Save Week'
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

  getFixtures: (state: State) => {
    return state.fixtures
  },

  getFilteredFixtures: (state: State) => (fixtureRound) => {
    return state.fixtures.filter((x) => +x.week === fixtureRound)[0].fixtures
  },

  getUser: (state: State) => {
    return state.user
  },

  isLoggedIn: (state: State) => !!state.user.tokens,

  isLoading: (state: State) => state.loading,
}
