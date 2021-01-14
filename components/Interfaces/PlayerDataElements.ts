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
  web_name: string
  element_type: PlayerPositionShort
}
