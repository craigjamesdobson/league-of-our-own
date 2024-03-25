interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface Fixture {
  id: number;
  home_team: Team;
  home_team_score: number;
  away_team: Team;
  away_team_score: number;
}

export type { Team, Fixture };
