import Teams from 'static/teams.json'

export class CompleteTeam {
  public readonly id: number
  public readonly name: string
  public readonly shortName: string

  constructor(matchTeamID: number) {
    this.id = matchTeamID
    this.name = Teams.filter((x) => x.id === matchTeamID)[0].name
    this.shortName = Teams.filter((x) => x.id === matchTeamID)[0].short_name
  }
}
