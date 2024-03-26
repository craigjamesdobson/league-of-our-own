import type { Tables } from './database.types';

interface Player {
  player_id: number;
  code: number;
  image: string;
  image_large: string;
  web_name: string;
  first_name: string;
  second_name: string;
  goals_scored: number;
  clean_sheets: number;
  red_cards: number;
  cost: number;
  status: string;
  is_unavailable: boolean;
  unavailable_for_season: boolean;
  news: string;
  position: number;
  team: number;
  team_name: string;
  team_short_name: string;
  created_at?: string;
}

interface PlayerWithStats extends Tables<'players_view'> {
  week_goals: number;
  week_assists: number;
  week_redcard: boolean;
  week_cleansheet: boolean;
}

export type { Player, PlayerWithStats };
