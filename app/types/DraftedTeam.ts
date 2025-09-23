import type { Tables } from './database.types';
import type { DraftedPlayerWithWeeklyStats } from './DraftedPlayer';

type DraftedTeam = Tables<'drafted_teams'> & { is_invalid_team: boolean };
type DraftedTeamWithPlayers = DraftedTeam & {
  players: DraftedPlayerWithWeeklyStats[];
};

type DraftedTeamWithWeeklyStats = DraftedTeam & {
  players: DraftedPlayerWithWeeklyStats[];
  weekly_stats: Tables<'weekly_statistics'>[];
};

type WeeklyStats = Tables<'weekly_statistics'>;

export type { DraftedTeam, DraftedTeamWithPlayers, DraftedTeamWithWeeklyStats, WeeklyStats };
