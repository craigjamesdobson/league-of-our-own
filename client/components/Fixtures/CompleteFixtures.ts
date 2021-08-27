import { Weeks } from '../Interfaces/Weeks'
import { CompleteFixture } from './CompleteFixture'
import { CompleteWeek } from './CompleteWeek'

export class CompleteFixtures {
  public readonly week: String
  public readonly fixtures: Object
  public readonly updatedAt: String

  constructor(weeks: Weeks) {
    this.week = weeks.week
    this.fixtures = weeks.fixtures.map((x) => new CompleteFixture(x))
    this.updatedAt = weeks.updatedAt
  }
}

export function initFixturesData(weeks) {
  return weeks.map((x) => new CompleteFixtures(x))
}
