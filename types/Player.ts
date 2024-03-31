import type { Tables } from './database.types';

interface Player extends Tables<'players_view'> {}

interface PlayerWithStats extends Player {
  week_goals: number;
  week_assists: number;
  week_redcard: boolean;
  week_cleansheet: boolean;
}

export type { Player, PlayerWithStats };
