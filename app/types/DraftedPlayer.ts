import type { Tables } from './database.types';

interface DraftedTransfer {
  drafted_transfer_id: number;
  active_transfer_expiry: Date;
  transfer_week: number;
  data: Tables<'players_view'>;
  selected: boolean;
}

interface DraftedTransferWithWeeklyStats extends DraftedTransfer {
  points?: number;
  week_goals?: number;
  week_assists?: number;
  week_redcards?: number;
  week_cleansheets?: number;
}

interface DraftedPlayer {
  drafted_player_id: number;
  transfers: DraftedTransferWithWeeklyStats[];
  data: Tables<'players_view'>;
}

interface DraftedPlayerWithWeeklyStats extends DraftedPlayer {
  points?: number;
  week_goals?: number;
  week_assists?: number;
  week_redcards?: number;
  week_cleansheets?: number;
  selected?: boolean;
}

export type { DraftedPlayer, DraftedTransfer, DraftedPlayerWithWeeklyStats, DraftedTransferWithWeeklyStats };
