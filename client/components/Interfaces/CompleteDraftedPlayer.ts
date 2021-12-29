import DraftedTransfer from '@/components/DraftedTeams/Logic/DraftedTransfer'
import Player from '../Players/Player'

export default interface CompleteDraftedPlayer {
  player: Player
  transfers: DraftedTransfer[]
}
