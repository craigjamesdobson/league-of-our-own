import type { Tables } from './database-generated.types';

interface DraftedTransfer {
  drafted_transfer_id: number;
  active_transfer_expiry: Date;
  transfer_week: number;
  data: Tables<'players_view'>;
}

interface DraftedPlayer {
  data: Tables<'players_view'>;
  drafted_player_id: number;
  transfers: DraftedTransfer[];
}

export type { DraftedPlayer, DraftedTransfer };
