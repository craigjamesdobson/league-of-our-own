import type { Tables } from './database.types';
import type { DraftedPlayerWithWeeklyStats } from './DraftedPlayer';

type DraftedTeam = Tables<'drafted_teams'> & { is_invalid_team: boolean };
type TeamAdminMetadata = Pick<
  Tables<'drafted_teams'>,
  'drafted_team_id' | 'created_at' | 'updated_at' | 'edited_count'
>;
type DraftedTeamWithPlayers = DraftedTeam & {
  players: DraftedPlayerWithWeeklyStats[];
};

type DraftedTeamWithWeeklyStats = DraftedTeam & {
  players: DraftedPlayerWithWeeklyStats[];
  weekly_stats: Tables<'weekly_statistics'>[];
};

type WeeklyStats = Tables<'weekly_statistics'>;

export type {
  DraftedTeam,
  DraftedTeamWithPlayers,
  DraftedTeamWithWeeklyStats,
  TeamAdminMetadata,
  WeeklyStats,
};
