interface WeeklyData {
  drafted_team_id: number;
  team_name: string;
  team_owner: string;
  goals: number;
  assists: number;
  clean_sheets: number;
  red_cards: number;
  total_points: number;
  week_points: number;
  weekly_winner: boolean;
  prev_week_position: number;
}

interface WeeklyWinner {
  team_name: string;
  team_owner: string;
}

interface WeeklyWinners {
  week: number;
  top_teams: WeeklyWinner[];
  points: number;
}

export type { WeeklyData, WeeklyWinners };
