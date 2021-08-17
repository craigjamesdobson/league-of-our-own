import { Fixture } from '../Interfaces/Fixture'
import { Week } from '../Interfaces/Weeks'
import { CompleteFixture } from './CompleteFixture'

export class CompleteWeek {
  public readonly week: string
  public readonly fixtures: Fixture[]

  constructor(week: Week) {
    this.week = week.week
    this.fixtures = week.fixtures.map((x) => new CompleteFixture(x))
  }
}
