import GameweekStats from '~/components/Interfaces/GameweekStats'
import CompleteDraftedPlayer from './CompleteDraftedPlayer'
import DraftedTeam from './DraftedTeam'

class CompleteDraftedTeam {
  public readonly teamID: number
  public readonly teamName: string
  public readonly ownerName: string
  private readonly isInvalidTeam: boolean
  private readonly invalidErrorMsg: string[]
  private readonly allowedTransfers: boolean
  private readonly teamValueAllowed: number
  private totalTeamValue: number
  private readonly teamPlayers: CompleteDraftedPlayer[]
  private readonly gameWeekStats: any
  public readonly totalPoints: number
  public readonly totalGoals: number
  public readonly totalAssists: number
  public readonly totalRedCards: number
  public readonly totalCleanSheets: number

  constructor(draftedTeam: DraftedTeam, players: any[]) {
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

    this.gameWeekStats = draftedTeam.gameWeekStats

    this.totalTeamValue = 0

    this.teamPlayers.forEach((player) => {
      if (player.transfers.length > 0) {
        this.totalTeamValue +=
          +player.transfers[player.transfers.length - 1].player.price
      } else {
        this.totalTeamValue += +player.price
      }
    })

    this.totalPoints = draftedTeam.gameWeekStats
      .map((stat: any) => stat.points)
      .reduce((prev, next) => prev + next)

    this.totalGoals = draftedTeam.gameWeekStats
      .map((stat: any) => stat.goals)
      .reduce((prev, next) => prev + next)

    this.totalAssists = draftedTeam.gameWeekStats
      .map((stat: any) => +stat.assists)
      .reduce((prev, next) => prev + next)

    this.totalCleanSheets = draftedTeam.gameWeekStats
      .map((stat: any) => +stat.cleanSheets)
      .reduce((prev, next) => prev + next)

    this.totalRedCards = draftedTeam.gameWeekStats
      .map((stat: any) => +stat.redCards)
      .reduce((prev, next) => prev + next)

    let goalkeeperCount = 0
    let defenderCount = 0
    let midfielderCount = 0
    let forwardCount = 0

    for (const teamPlayer of this.teamPlayers) {
      const playerPosition = teamPlayer.position

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
export default CompleteDraftedTeam
