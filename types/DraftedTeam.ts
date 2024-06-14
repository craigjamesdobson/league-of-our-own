import type { DraftedPlayer } from './DraftedPlayer';

interface DraftedTeam {
  drafted_team_id: number;
  team_name: string;
  team_owner: string;
  team_email: string;
  allowed_transfers: boolean;
  players: DraftedPlayer[];
  total_team_value?: number;
  is_invalid_team?: boolean;
}

interface WeeklyStats {
  drafted_team_id: number;
  points: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  red_cards: number;
}

interface DraftedTeamWithWeeklyStats extends DraftedTeam {
  weekly_stats: WeeklyStats;
}

export type { DraftedTeam, DraftedTeamWithWeeklyStats, WeeklyStats };
