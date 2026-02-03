import type { Tables } from './database.types';

type Player = Tables<'players_view'>;

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

interface PlayerSeasonStats extends Player {
  season_goals: number;
  season_assists: number;
  season_points: number;
  season_clean_sheets: number;
  season_red_cards: number;
}

export type { Player, PlayerSeasonStats, PlayerWithStats, PlayerInsertData };
