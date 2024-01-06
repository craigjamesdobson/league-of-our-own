import type { Tables } from './database.types';

interface DraftedTransfer {
  drafted_transfer_id: number;
  active_transfer_expiry: string;
  transfer_week: number;
  player: Tables<'players_view'>;
}

interface DraftedPlayer extends Tables<'players_view'> {
  transfers: DraftedTransfer[] | [];
}

export type { DraftedPlayer, DraftedTransfer };
