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

export type { Player, PlayerWithStats, PlayerInsertData };
