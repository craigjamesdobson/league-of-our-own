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
  verified_by?: string | null;
  verified_at?: string | null;
  populated_by?: string | null;
  populated_at?: string | null;
  verified_profile?: { full_name: string | null } | null;
  populated_profile?: { full_name: string | null } | null;
}

export type { Team, Fixture };
