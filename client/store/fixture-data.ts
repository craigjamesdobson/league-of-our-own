/* eslint-disable camelcase */

import axios from '@/plugins/axios'
import {
  FETCH_FIXTURES,
  UPDATE_FIXTURESCORE,
  STORE_PLAYERSTATS,
  SET_UPDATEDBYUSER
} from './mutation-types'
import { initFixturesData } from '~/components/Fixtures/CompleteFixtures'

interface Team {
  id: number
  shortName: string
  name: string
  stats: []
}

interface Fixture {
  id: number
  home: Team[]
  away: Team[]
  score: [number, number]
}

interface Weeks {
  week: string
  fixtures: Fixture[]
  updatedAt: string
  updatedBy?: string
}

interface State {
  fixtures: Weeks[]
  fixturesLoaded: Boolean
}

export const state = (): State => ({
  fixtures: [],
  fixturesLoaded: false
})

export const mutations = {
  [FETCH_FIXTURES](state: State, fixtures: any) {
    state.fixtures = initFixturesData(fixtures)
    state.fixturesLoaded = true
  },

  [UPDATE_FIXTURESCORE](state: State, formData: any) {
    const selectedWeek = state.fixtures.filter(
      (x) => x.week === formData.activeWeek.toString()
    )

    const selectedFixture = selectedWeek[0].fixtures.filter(
      (x) => x.id === formData.selectedFixtureID
    )

    this._vm.$set(selectedFixture[0], 'score', formData.score)
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

      this._vm.$set(
        activePlayerStats[0],
        [currentStatType],
        formData.stats.playerStat
      )
    } else {
      selectedFixture[0][formData.activeVenue].stats.push({
        playerID: formData.stats.playerID,
        [formData.stats.statType]: formData.stats.playerStat
      })
    }
  },

  [SET_UPDATEDBYUSER](state: State, payload) {
    const selectedWeek = state.fixtures.filter(
      (x) => x.week === payload.activeWeek.toString()
    )

    selectedWeek[0].updatedAt = new Date().toISOString()
    selectedWeek[0].updatedBy = payload.userName
  }
}

export const actions = {
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

  async updateFixtureCollection(
    { state, commit, getters, rootState }: any,
    activeWeek: any
  ) {
    const userName = getters.getUserName

    try {
      await commit('SET_UPDATEDBYUSER', { activeWeek, userName })
    } catch (err) {
      throw err
    }
    const selectedWeek = state.fixtures.filter(
      (x) => x.week === activeWeek.toString()
    )

    const gameWeekData = rootState.playerData.players.players.map((x) => {
      return { id: x.id, gameWeekStats: x.gameWeekStats }
    })

    try {
      return Promise.all([
        axios.post('/v1/fixtures/update', ...selectedWeek),
        axios.post('/v1/players/update', gameWeekData)
      ])
    } catch (err) {
      throw err.response.data
    }
  }
}

export const getters = {
  getFixtures: (state: State) => {
    return state.fixtures
  },

  getFilteredFixtures: (state: State) => (fixtureRound) => {
    const fixture = state.fixtures.filter((x) => +x.week === fixtureRound)[0]
    return {
      fixtures: fixture.fixtures,
      updatedAt: fixture.updatedAt,
      updatedBy: fixture.updatedBy
    }
  },

  getUserName: (state, getters, rootState, rootGetters) => {
    return rootState.user.name
  }
}
