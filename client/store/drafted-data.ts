import { FETCH_DRAFTEDTEAMS, UPDATE_DRAFTEDTEAMS } from './mutation-types'
import { initDraftedTeamData } from '@/components/DraftedTeams/Logic/CreateDraftedTeams'
import axios from '@/plugins/axios'
import omit from 'lodash-es'

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

  async updateDraftedTeams({ state, commit }: any, payload) {
    await commit('UPDATE_DRAFTEDTEAMS', {
      fixtureWeek: payload.fixtureWeek,
      gameweekStats: payload.gameweekData,
    })

    const gameWeekData = state.draftedTeamData.map((x) => {
      return { id: x.teamID, gameWeekStats: x.gameWeekStats }
    })

    return axios.post('/v1/drafted-teams/update', gameWeekData)
  },
}

export const getters = {
  getDraftedTeams: (state: State) => {
    return state.draftedTeamData
  },

  getSortedTeams: (state: State) => (activeGameweek) => {
    // Create an empty array that will have additional properties added.
    const teams: any = []

    state.draftedTeamData.forEach((team) => {
      // Loop through gameweek stats and return any that are before or equal to the active gameweek
      const filteredGameweeks = team.gameWeekStats.filter(
        (x) => x.gameweek <= activeGameweek.value
      )
      // Push a copy of the teams and add a new activeGameWeekStats property with the filtered gameweek data
      teams.push({ ...team, activeGameWeekStats: filteredGameweeks })
    })
    // Loop through new teams array
    teams.forEach((team) => {
      // Create a new isWeeklyWinner property and set it to false by default
      team.isWeeklyWinner = false

      // get the active weeks points total and set new property
      team.activeWeekPoints = team.gameWeekStats.filter(
        (x) => x.gameweek === activeGameweek.value
      )[0].points

      // Using the activeGameWeekStats figure out sum of all stats and set new properties
      team.totalGoals = team.activeGameWeekStats.reduce(
        (sum, gameweek) => sum + +gameweek.goals,
        0
      )
      team.totalAssists = team.activeGameWeekStats.reduce(
        (sum, gameweek) => sum + +gameweek.assists,
        0
      )
      team.totalCleanSheets = team.activeGameWeekStats.reduce(
        (sum, gameweek) => sum + +gameweek.cleanSheets,
        0
      )
      team.totalRedCards = team.activeGameWeekStats.reduce(
        (sum, gameweek) => sum + +gameweek.redCards,
        0
      )
      team.totalPoints = team.activeGameWeekStats.reduce(
        (sum, gameweek) => sum + +gameweek.points,
        0
      )

      // Check if its not the first gameweek
      if (activeGameweek.value > 1) {
        // Remove the most recent activeGameweekStat array so we can figure out last weeks position
        team.activeGameWeekStats.pop()

        // Now that last weeks gameweek data has been removed figure out the points total and assign new property
        team.prevWeekPoints = team.activeGameWeekStats.reduce(
          (sum, gameweek) => sum + +gameweek.points,
          0
        )
      } else {
        // If it is the first gameweek set previous points to 0
        team.prevWeekPoints = 0
      }
    })

    let topWeekPoints = 0
    if (teams.length) {
      // Sort the teams by previous week score
      teams
        .sort((a, b) => b.prevWeekPoints - a.prevWeekPoints)
        .forEach((team) => {
          if (activeGameweek.value > 1) {
            // Find the index position of the teams in this order and set the value (+ 1) to new property
            team.previousWeekPosition = teams.findIndex((x) => x === team) + 1
          } else {
            // If gameweek 1 set to 'N/A'
            team.previousWeekPosition = 'N/A'
          }
        })

      // Now sort by activeWeekPoints and populate topWeekPoints variable
      topWeekPoints = teams.sort(
        (a, b) => b.activeWeekPoints - a.activeWeekPoints
      )[0].activeWeekPoints
    }

    teams.forEach((team) => {
      // Loop through teams and check which teams have the top score and if they do set the isWeeklyWinner property to true
      if (
        team.activeWeekPoints === topWeekPoints &&
        team.activeWeekPoints > 0
      ) {
        team.isWeeklyWinner = true
      }
    })

    // Return the teams sorted by totalPoints and with all the new properties populated
    return teams.sort((a, b) => {
      if (b.totalPoints === a.totalPoints) {
        return b.totalGoals - a.totalGoals
      } else {
        return b.totalPoints - a.totalPoints
      }
    })
  },
}
