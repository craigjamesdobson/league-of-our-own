import type { Tables } from './database-generated.types';

interface Player extends Tables<'players_view'> {}

export type { Player };
