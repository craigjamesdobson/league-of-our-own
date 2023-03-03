import Fixture from '../../../v2/components/Interfaces/Fixture'
import CompleteTeam from './CompleteTeam'

class CompleteFixture {
  public readonly id: number
  public readonly home: CompleteTeam
  public readonly away: CompleteTeam
  public readonly score: [number, number]

  constructor(fixture: Fixture) {
    this.id = fixture.id
    this.home = new CompleteTeam(fixture.home)
    this.away = new CompleteTeam(fixture.away)
    this.score = fixture.score
  }
}

export default CompleteFixture
