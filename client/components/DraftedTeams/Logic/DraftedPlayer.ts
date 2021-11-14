import DraftedPlayers from '@/components/Interfaces/DraftedPlayers'
import DraftedTransfer from './DraftedTransfer'

class DraftedPlayer {
  public readonly playerID: number
  public readonly transfers: DraftedTransfer[]

  constructor(draftedPlayer: DraftedPlayers) {
    this.playerID = draftedPlayer.player_id
    this.transfers = draftedPlayer.transfers.map((x) => new DraftedTransfer(x))
  }
}

export default DraftedPlayer
