/* eslint-disable camelcase */

import { PlayerPositionShort } from './PlayerPosition'

export interface PlayerDataElements {
  id: number
  code: string
  status: string
  news: string
  team: number
  now_cost: number
  cost_change_start_fall: number
  first_name: string
  second_name: string
  web_name: string
  element_type: PlayerPositionShort
  goals_scored: number
  assists: number
  clean_sheets: number
}
