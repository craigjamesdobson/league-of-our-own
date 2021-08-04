import { FETCH_DRAFTEDTEAMS } from './mutation-types'
import { initDraftedTeamData } from '@/components/DraftedTeams/CreateDraftedTeams'
import axios from 'axios'

interface State {
  playerStats: any
  draftedTeamData: any
}

export const state = () => ({
  playerStats: [],
  draftedTeamData: [],
})

export const mutations = {
  [FETCH_DRAFTEDTEAMS](state: State, payload) {
    state.draftedTeamData = initDraftedTeamData(
      payload.playerData,
      payload.draftedTeamData
    )
  },
}

export const actions = {
  async fetchDraftedTeams({ commit }: any, playerData) {
    await axios
      .get('http://localhost:8080/v1/drafted-teams')
      .then((res) => {
        commit('FETCH_DRAFTEDTEAMS', {
          draftedTeamData: res.data,
          playerData: playerData,
        })
      })
      .catch((err) => {
        throw err.response.data
      })
  },
}

export const getters = {
  getDraftedTeams: (state: State) => {
    return state.draftedTeamData
  },
}
