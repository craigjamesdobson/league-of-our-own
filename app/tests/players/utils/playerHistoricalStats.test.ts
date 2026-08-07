import { describe, expect, it } from 'vitest';
import { createMockHistoricalCleanSheetStats } from '@/tests/factories';
import { PlayerPosition } from '@/types/PlayerPosition';
import { getHistoricalCleanSheetsForDisplay } from '@/utils/playerHistoricalStats';

describe('getHistoricalCleanSheetsForDisplay', () => {
  it.each([PlayerPosition.MIDFIELDER, PlayerPosition.FORWARD])(
    'zeros clean sheets for position %s',
    (position) => {
      const historicalStats = createMockHistoricalCleanSheetStats({ clean_sheets: 15 });

      expect(getHistoricalCleanSheetsForDisplay(
        position,
        historicalStats.clean_sheets,
      )).toBe(0);
    },
  );

  it.each([PlayerPosition.GOALKEEPER, PlayerPosition.DEFENDER])(
    'retains clean sheets for position %s',
    (position) => {
      const historicalStats = createMockHistoricalCleanSheetStats();

      expect(getHistoricalCleanSheetsForDisplay(
        position,
        historicalStats.clean_sheets,
      )).toBe(historicalStats.clean_sheets);
    },
  );
});
