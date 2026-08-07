import { describe, expect, it } from 'vitest';
import { createMockFplHistoryPast } from '@/tests/factories';
import {
  buildPreviousSeasonStatisticsRows,
  getPreviousSeasonStatistics,
} from '../../../server/utils/fplPreviousSeason';

describe('getPreviousSeasonStatistics', () => {
  it('selects the latest completed season from FPL history', () => {
    expect(getPreviousSeasonStatistics(1, [
      createMockFplHistoryPast({ assists: 3 }),
      createMockFplHistoryPast({
        season_name: '2024/25',
        total_points: 142,
        minutes: 3420,
        clean_sheets: 13,
      }),
    ])).toEqual({
      player_id: 1,
      season_name: '2025/26',
      previous_season_goals: 0,
      previous_season_assists: 3,
      previous_season_clean_sheets: 19,
      previous_season_red_cards: 0,
      previous_season_points: 162,
      previous_season_minutes: 3330,
    });
  });

  it('defaults missing history to zeroes', () => {
    expect(getPreviousSeasonStatistics(2, [])).toEqual({
      player_id: 2,
      season_name: null,
      previous_season_goals: 0,
      previous_season_assists: 0,
      previous_season_clean_sheets: 0,
      previous_season_red_cards: 0,
      previous_season_points: 0,
      previous_season_minutes: 0,
    });
  });
});

describe('buildPreviousSeasonStatisticsRows', () => {
  it('maps the fetched statistics to the durable snapshot shape', () => {
    expect(buildPreviousSeasonStatisticsRows([{
      player_id: 1,
      season_name: '2025/26',
      previous_season_goals: 7,
      previous_season_assists: 4,
      previous_season_clean_sheets: 6,
      previous_season_red_cards: 1,
      previous_season_points: 42,
      previous_season_minutes: 3330,
    }], '2026-08-05T22:00:00.000Z')).toEqual([{
      player_id: 1,
      season_name: '2025/26',
      minutes: 3330,
      goals: 7,
      assists: 4,
      clean_sheets: 6,
      red_cards: 1,
      points: 42,
      synced_at: '2026-08-05T22:00:00.000Z',
    }]);
  });
});
