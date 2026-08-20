import type { FplHistoryPast } from '../../../server/utils/fplPreviousSeason';

export const createMockFplHistoryPast = (
  overrides?: Partial<FplHistoryPast>,
): FplHistoryPast => ({
  season_name: '2025/26',
  total_points: 162,
  minutes: 3330,
  goals_scored: 0,
  assists: 0,
  clean_sheets: 19,
  red_cards: 0,
  ...overrides,
});
