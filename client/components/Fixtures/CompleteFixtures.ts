import { Fixtures } from '../Interfaces/Fixtures'
import { CompleteFixture } from './CompleteFixture'

export class CompleteFixtures {
  public readonly name: string
  public readonly matches: Object

  constructor(fixtures: Fixtures) {
    this.name = fixtures.name
    this.matches = fixtures.matches.map((x) => new CompleteFixture(x))
  }
}

export function initFixturesData(fixtures) {
  return fixtures.map((x) => new CompleteFixtures(x))
}
