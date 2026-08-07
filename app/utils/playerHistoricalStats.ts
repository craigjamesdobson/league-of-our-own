import { PlayerPosition } from '@/types/PlayerPosition';

const POSITIONS_WITHOUT_HISTORICAL_CLEAN_SHEETS = new Set([
  PlayerPosition.MIDFIELDER,
  PlayerPosition.FORWARD,
]);

export const getHistoricalCleanSheetsForDisplay = (
  position: number,
  cleanSheets: number,
): number => POSITIONS_WITHOUT_HISTORICAL_CLEAN_SHEETS.has(position) ? 0 : cleanSheets;
