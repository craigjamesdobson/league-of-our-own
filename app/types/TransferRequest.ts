import type { Tables } from './database.types';

type TransferRequest = Tables<'transfer_requests'> & {
  items: Tables<'transfer_request_items'>[];
};

type TransferHistoryItem = {
  playerOut: string;
  playerIn: string;
  transferWeek: number;
  playerOutImage?: string | null;
  playerInImage?: string | null;
  playerOutTeam?: string | null;
  playerInTeam?: string | null;
};

type TransferHistory = {
  beforeJanuary: TransferHistoryItem[];
  afterJanuary: TransferHistoryItem[];
};

export type { TransferHistory, TransferHistoryItem, TransferRequest };
