import type { Tables } from './database.types';

interface Player extends Tables<'players_view'> {}

interface PlayerWithStats extends Player {
  week_goals: number;
  week_assists: number;
  week_redcard: boolean;
  week_cleansheet: boolean;
  week_points: number;
}

export type { Player, PlayerWithStats };
