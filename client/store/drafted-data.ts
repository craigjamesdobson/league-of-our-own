import { FETCH_DRAFTEDTEAMS, UPDATE_DRAFTEDTEAMS } from './mutation-types'
import { initDraftedTeamData } from '@/components/DraftedTeams/Logic/CreateDraftedTeams'
import axios from '@/plugins/axios'

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

  [UPDATE_DRAFTEDTEAMS](state: State, payload) {
    let selectedTeam = null
    payload.gameweekStats.gameweekData.forEach((teamStats) => {
      selectedTeam = state.draftedTeamData.filter(
        (x) => x.teamID === teamStats.teamID
      )[0]
      const teamGamweekIndex = selectedTeam.gameWeekStats.findIndex(
        (x) => x.gameweek === payload.fixtureWeek
      )

      // selectedTeam.gameWeekStats.filter(
      //   (x) => x.gameweek === payload.fixtureWeek
      // )[0] = {
      //   gameweek: teamStats.gameweek,
      //   goals: teamStats.goals,
      //   assists: teamStats.assists,
      //   cleanSheets: teamStats.cleanSheets,
      //   redCards: teamStats.redCards,
      //   points: teamStats.points,
      // }

      this._vm.$set(selectedTeam.gameWeekStats, teamGamweekIndex, {
        gameweek: teamStats.gameweek,
        goals: teamStats.goals,
        assists: teamStats.assists,
        cleanSheets: teamStats.cleanSheets,
        redCards: teamStats.redCards,
        points: teamStats.points,
      })
    })
  },
}

export const actions = {
  async fetchDraftedTeams({ commit }: any, playerData) {
    await axios
      .get('/v1/drafted-teams')
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

  async updateDraftedTeams({ commit }: any, payload) {
    commit('UPDATE_DRAFTEDTEAMS', {
      fixtureWeek: payload.fixtureWeek,
      gameweekStats: payload.gameweekData,
    })
  },
}

export const getters = {
  getDraftedTeams: (state: State) => {
    return state.draftedTeamData
  },
}
