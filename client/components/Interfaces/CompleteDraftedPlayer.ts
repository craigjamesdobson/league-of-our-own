import { DraftedTransfer } from '../DraftedTeams/DraftedTransfer'
import { Player } from '../Players/Player'

export interface CompleteDraftedPlayer {
  player: Player
  transfers: DraftedTransfer[]
}
