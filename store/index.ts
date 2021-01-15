/* eslint-disable camelcase */

import Players from 'static/players.json'
import Teams from 'static/teams.json'
import { initPlayerData } from '@/components/Players/CreatePlayerData'
import { Player } from '@/components/Players/Player'
import { PlayerPositionShort } from '@/components/Interfaces/PlayerPosition'
import { UPDATE_PLAYERS, GET_TEAMS } from './mutation-types'

interface State {
  players: any
  teams: any
  loading: boolean
}

export const state = () => ({
  players: initPlayerData(Players),
  teams: Teams,
  loading: false,
})

export const mutations = {
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

export const actions = {}

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
}
