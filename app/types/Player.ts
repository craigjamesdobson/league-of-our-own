import type { Tables } from './database.types';

type Player = Tables<'players_view'>;

interface PlayerSeasonStatistics {
  season_goals: number;
  season_assists: number;
  season_clean_sheets: number;
  season_red_cards: number;
  season_points: number;
}

interface PlayerPreviousSeasonStatistics {
  player_id: number;
  previous_season_goals: number;
  previous_season_assists: number;
  previous_season_clean_sheets: number;
  previous_season_red_cards: number;
  previous_season_points: number;
  previous_season_minutes: number;
}

type PlayerWithSeasonStatistics = Player & PlayerSeasonStatistics & PlayerPreviousSeasonStatistics;

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

export type {
  Player,
  PlayerPreviousSeasonStatistics,
  PlayerSeasonStatistics,
  PlayerWithSeasonStatistics,
  PlayerWithStats,
  PlayerInsertData,
};
