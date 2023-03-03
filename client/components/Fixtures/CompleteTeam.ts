import Teams from 'static/teams.json'
import { Stats, Team } from '../../../v2/components/Interfaces/Fixture'

class CompleteTeam {
  public readonly id: number
  public readonly name: string
  public readonly shortName: string
  public readonly stats: Stats[]

  constructor(matchTeam: Team) {
    this.id = matchTeam.id
    this.name = Teams.filter((x) => x.id === matchTeam.id)[0].name
    this.shortName = Teams.filter((x) => x.id === matchTeam.id)[0].short_name
    this.stats = matchTeam.stats
  }
}

export default CompleteTeam
