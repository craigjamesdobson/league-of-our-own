import { Weeks } from '../Interfaces/Weeks'
import { CompleteWeek } from './CompleteWeek'

export class CompleteFixtures {
  public readonly name: string
  public readonly weeks: Object

  constructor(fixtures: Weeks) {
    this.name = fixtures.name
    this.weeks = fixtures.weeks.map((x) => new CompleteWeek(x))
  }
}

export function initFixturesData(fixtures) {
  return fixtures.map((x) => new CompleteFixtures(x))
}
