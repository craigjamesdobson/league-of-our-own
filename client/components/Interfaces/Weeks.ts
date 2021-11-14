import Fixture from './Fixture'

export default interface Weeks {
  week: string
  fixtures: Fixture[]
  updatedAt: string
  updatedBy: string
}

export interface Week {
  week: string
  fixtures: Fixture[]
}
