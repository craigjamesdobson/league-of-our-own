/* eslint-disable camelcase */
import { DraftedPlayers } from './DraftedPlayers'
import { GameweekStats } from './GameweekStats'

export interface DraftedTeamDataElements {
  team_id: number
  team_name: string
  team_owner: string
  allowed_transfers: boolean
  team_players: DraftedPlayers[]
  gameweek_stats: GameweekStats[]
}
