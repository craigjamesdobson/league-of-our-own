import { CompleteDraftedPlayer as ICompleteDraftedPlayer } from '../Interfaces/CompleteDraftedPlayer'
import { CompleteDraftedPlayer } from './CompleteDraftedPlayer'
import { DraftedTeam } from './DraftedTeam'

export class CompleteDraftedTeam {
  public readonly teamID: number
  public readonly teamName: string
  public readonly ownerName: string
  private readonly isInvalidTeam: boolean
  private readonly invalidErrorMsg: string[]
  private readonly allowedTransfers: boolean
  private readonly teamValueAllowed: number
  private readonly totalTeamValue: number
  private readonly teamPlayers: CompleteDraftedPlayer[]

  constructor(draftedTeam: DraftedTeam, players: ICompleteDraftedPlayer[]) {
    this.teamID = draftedTeam.teamID
    this.teamName = draftedTeam.teamName
    this.ownerName = draftedTeam.ownerName
    this.invalidErrorMsg = []
    this.isInvalidTeam = false
    this.allowedTransfers = draftedTeam.allowedTransfers
    this.teamValueAllowed = this.allowedTransfers ? 85 : 95
    this.teamPlayers = players.map(
      (x) => new CompleteDraftedPlayer(x.player, x.transfers)
    )

    this.totalTeamValue = this.teamPlayers.reduce(
      (accumulator, current) =>
        (accumulator += parseFloat(current.playerPrice)),
      0
    )

    let goalkeeperCount = 0
    let defenderCount = 0
    let midfielderCount = 0
    let forwardCount = 0

    for (const teamPlayer of this.teamPlayers) {
      const playerPosition = teamPlayer.playerPosition

      switch (playerPosition) {
        case 'GK':
          goalkeeperCount++
          break
        case 'DEF':
          defenderCount++
          break
        case 'MID':
          midfielderCount++
          break
        case 'FWD':
          forwardCount++
          break
      }
    }

    if (goalkeeperCount > 1) {
      this.isInvalidTeam = true
      this.invalidErrorMsg.push('There are too many goalkeepers in the team')
    }

    if (defenderCount > 4) {
      this.isInvalidTeam = true
      this.invalidErrorMsg.push('There are too many defenders in the team')
    }

    if (midfielderCount > 3) {
      this.isInvalidTeam = true
      this.invalidErrorMsg.push('There are too many midfielders in the team')
    }

    if (forwardCount > 4) {
      this.isInvalidTeam = true
      this.invalidErrorMsg.push('There are too many fowards in the team')
    }

    if (this.totalTeamValue > this.teamValueAllowed) {
      this.isInvalidTeam = true
      this.invalidErrorMsg.push(
        `The team value exceeds the ${this.teamValueAllowed} million limit`
      )
    }
  }
}
