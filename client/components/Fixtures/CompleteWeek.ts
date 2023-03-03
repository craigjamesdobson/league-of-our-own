import Fixture from '../../../v2/components/Interfaces/Fixture'
import { Week } from '../../../v2/components/Interfaces/Weeks'
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
