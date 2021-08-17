export interface Stats {
  goals?: number
  assists?: number
  cleanSheet?: boolean
  sentOff?: boolean
}

export interface Team {
  id: number
  stats: Stats[]
}

export interface Fixture {
  id: number
  home: Team
  away: Team
  score: [number, number]
}
