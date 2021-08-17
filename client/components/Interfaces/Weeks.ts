import { Fixture } from './Fixture'

export interface Weeks {
  name: string
  weeks: Week[]
}

export interface Week {
  week: string
  fixtures: Fixture[]
}
