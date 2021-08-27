/* eslint-disable camelcase */

import axios from '@/plugins/axios'
import {
  FETCH_FIXTURES,
  UPDATE_FIXTURESCORE,
  STORE_PLAYERSTATS,
} from './mutation-types'
import { initFixturesData } from '~/components/Fixtures/CompleteFixtures'

interface Team {
  id: number
  shortName: string
  name: string
  stats: []
}

interface fixture {
  id: number
  home: Team[]
  away: Team[]
  score: [number, number]
}

interface Weeks {
  week: string
  fixtures: fixture[]
  updatedAt: string
}

interface State {
  fixtures: Weeks[]
}

export const state: State = {
  fixtures: [],
}

export const mutations = {
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

    const buttonPrevState = button.innerText
    button.innerText = 'Saving...'

    await axios
      .post('/v1/fixtures/update', ...selectedWeek)
      .then(() => {
        setTimeout(() => {
          button.innerHTML = buttonPrevState
        }, 1000)
      })
      .catch((err) => {
        button.innerHTML = buttonPrevState
        throw err.response.data
      })
  },
}

export const getters = {
  getFixtures: (state: State) => {
    return state.fixtures
  },

  getFilteredFixtures: (state: State) => (fixtureRound) => {
    const fixture = state.fixtures.filter((x) => +x.week === fixtureRound)[0]
    return { fixtures: fixture.fixtures, updatedAt: fixture.updatedAt }
  },
}
