interface Stats {
  goals?: number
  assists?: number
  cleanSheet?: boolean
  sentOff?: boolean
  points?: number
}

interface Team {
  id: number
  name?: string
  shortName?: string
  stats: Stats[]
}

export default interface Fixture {
  id: number
  home: Team
  away: Team
  score: [number, number]
}
