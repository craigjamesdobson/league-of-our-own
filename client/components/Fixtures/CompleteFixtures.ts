import Weeks from '../Interfaces/Weeks'
import CompleteFixture from './CompleteFixture'

class CompleteFixtures {
  public readonly week: String
  public readonly fixtures: Object
  public readonly isIncomplete: Boolean
  public readonly updatedAt: String
  public readonly updatedBy: String

  constructor(weeks: Weeks) {
    this.week = weeks.week
    this.fixtures = weeks.fixtures.map((x) => new CompleteFixture(x))
    this.isIncomplete = weeks.isIncomplete
    this.updatedAt = weeks.updatedAt
    this.updatedBy = weeks.updatedBy
  }
}

function initFixturesData(weeks) {
  return weeks.map((x) => new CompleteFixtures(x))
}

export default initFixturesData
