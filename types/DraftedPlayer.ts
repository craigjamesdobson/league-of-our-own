import type { Tables } from './database-generated.types';

interface DraftedTransfer {
  drafted_transfer_id: number;
  active_transfer_expiry: Date;
  transfer_week: number;
  data: Tables<'players_view'>;
  points?: number;
}

interface DraftedPlayer {
  drafted_player_id: number;
  transfers: DraftedTransfer[];
  data: Tables<'players_view'>;
  points?: number;
}

export type { DraftedPlayer, DraftedTransfer };
