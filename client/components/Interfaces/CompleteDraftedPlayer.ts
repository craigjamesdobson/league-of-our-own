import { DraftedTransfer } from '@/components/DraftedTeams/Logic/DraftedTransfer'
import { Player } from '../Players/Player'

export interface CompleteDraftedPlayer {
  player: Player
  transfers: DraftedTransfer[]
}
