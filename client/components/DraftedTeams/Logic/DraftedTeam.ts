import DraftedPlayer from '@/components/DraftedTeams/Logic/DraftedPlayer'
import DraftedTeamDataElements from '@/components/Interfaces/DraftedTeamDataElements'
import GameweekStats from '~/components/Interfaces/GameweekStats'

class DraftedTeam {
  public readonly teamID: number
  public readonly teamName: string
  public readonly ownerName: string
  public readonly allowedTransfers: boolean
  public readonly teamPlayers: DraftedPlayer[]
  public readonly gameWeekStats: GameweekStats[]

  constructor(draftedTeam: DraftedTeamDataElements) {
    this.teamID = draftedTeam.team_id
    this.teamName = draftedTeam.team_name.toUpperCase()
    this.ownerName = draftedTeam.team_owner
    this.allowedTransfers = draftedTeam.allowed_transfers
    this.teamPlayers = draftedTeam.team_players.map((x) => new DraftedPlayer(x))
    this.gameWeekStats = draftedTeam.gameweek_stats
  }
}

export default DraftedTeam
