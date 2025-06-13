interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface Fixture {
  id: number;
  game_week?: number;
  home_team: Team;
  home_team_score: number;
  away_team: Team;
  away_team_score: number;
  verified?: boolean | null;
}

export type { Team, Fixture };
