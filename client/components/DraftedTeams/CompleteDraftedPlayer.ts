import { Player } from '../Players/Player'
import { PlayerPositionShort } from '../Interfaces/PlayerPosition'
import { DraftedTransfer } from './DraftedTransfer'

export class CompleteDraftedPlayer {
  public readonly price: string
  public readonly position: string
  private readonly id: number
  private readonly name: string
  private readonly teamId: number
  private readonly teamName: string
  private readonly teamShort: string
  private readonly isUnavailable: boolean
  private readonly isUnavailableForSeason: boolean
  private readonly status: string
  private readonly image: string
  private readonly imageLarge: string
  private readonly transfers: DraftedTransfer[]

  constructor(player: Player, transfers: DraftedTransfer[]) {
    this.id = player.id
    this.name = player.name
    this.position = PlayerPositionShort[player.playerType]
    this.teamId = player.teamID
    this.teamName = player.teamName
    this.teamShort = player.teamShort
    this.isUnavailable = player.isUnavailable
    this.isUnavailableForSeason = player.unavailableForSeason
    this.status = player.availabilityType
    this.price = player.price
    this.image = player.image
    this.imageLarge = player.imageLarge
    this.transfers = transfers
  }
}
