import Fixture from '../Interfaces/Fixture'
import { Week } from '../Interfaces/Weeks'
import CompleteFixture from './CompleteFixture'

class CompleteWeek {
  public readonly week: string
  public readonly fixtures: Fixture[]

  constructor(week: Week) {
    this.week = week.week
    this.fixtures = week.fixtures.map((x) => new CompleteFixture(x))
  }
}

export default CompleteWeek
