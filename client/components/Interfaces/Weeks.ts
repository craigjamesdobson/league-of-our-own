import { Fixture } from './Fixture'

export interface Weeks {
  week: string
  fixtures: Fixture[]
  updatedAt: string
  updatedBy: string
}

export interface Week {
  week: string
  fixtures: Fixture[]
}
