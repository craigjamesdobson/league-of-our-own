import type { Tables } from './database.types';

type Player = Tables<'players_view'>;

interface PlayerSeasonStatistics {
  season_goals: number;
  season_assists: number;
  season_clean_sheets: number;
  season_red_cards: number;
  season_points: number;
}

type PlayerWithSeasonStatistics = Player & PlayerSeasonStatistics;

interface PlayerInsertData extends Tables<'players'> {
  id: number;
}

interface PlayerWithStats extends Player {
  week_goals: number;
  week_assists: number;
  week_redcard: boolean;
  week_cleansheet: boolean;
  week_points: number;
}

export type { Player, PlayerSeasonStatistics, PlayerWithSeasonStatistics, PlayerWithStats, PlayerInsertData };
