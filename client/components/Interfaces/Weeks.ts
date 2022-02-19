import Fixture from './Fixture'

export default interface Weeks {
  week: string
  fixtures: Fixture[]
  isIncomplete: Boolean
  updatedAt: string
  updatedBy: string
}

export interface Week {
  week: string
  fixtures: Fixture[]
}
