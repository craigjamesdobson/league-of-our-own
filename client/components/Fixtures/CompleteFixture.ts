import { Match } from '../Interfaces/Match'
import { CompleteTeam } from './CompleteTeam'

export class CompleteFixture {
  public readonly round: string
  public readonly home: CompleteTeam
  public readonly away: CompleteTeam

  constructor(match: Match) {
    this.round = match.round
    this.home = new CompleteTeam(match.home)
    this.away = new CompleteTeam(match.away)
  }
}
