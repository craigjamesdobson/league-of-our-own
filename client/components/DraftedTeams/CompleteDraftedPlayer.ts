import { Player } from '../Players/Player'
import { PlayerPositionShort } from '../Interfaces/PlayerPosition'
import { DraftedTransfer } from './DraftedTransfer'

export class CompleteDraftedPlayer {
  public readonly playerPrice: string
  public readonly playerPosition: string
  private readonly playerId: number
  private readonly playerName: string
  private readonly playerTeamId: number
  private readonly playerTeamName: string
  private readonly playerTeamShort: string
  private readonly isUnAvailable: boolean
  private readonly playerStatus: string
  private readonly transfers: DraftedTransfer[]

  constructor(player: Player, transfers: DraftedTransfer[]) {
    this.playerId = player.id
    this.playerName = player.name
    this.playerPosition = PlayerPositionShort[player.playerType]
    this.playerTeamId = player.teamID
    this.playerTeamName = player.teamName
    this.playerTeamShort = player.teamShort
    this.isUnAvailable = player.isUnavailable
    this.playerStatus = player.availabilityType
    this.playerPrice = player.price
    this.transfers = transfers
  }
}
