import { describe, expect, it } from 'vitest';
import { getPreviousSeasonStatistics } from '../../../server/utils/fplPreviousSeason';

describe('getPreviousSeasonStatistics', () => {
  it('selects the latest completed season from FPL history', () => {
    expect(getPreviousSeasonStatistics(1, [
      {
        season_name: '2025/26',
        total_points: 162,
        minutes: 3330,
        goals_scored: 0,
        assists: 0,
        clean_sheets: 19,
        red_cards: 0,
      },
      {
        season_name: '2024/25',
        total_points: 142,
        minutes: 3420,
        goals_scored: 0,
        assists: 0,
        clean_sheets: 13,
        red_cards: 0,
      },
    ])).toEqual({
      player_id: 1,
      previous_season_goals: 0,
      previous_season_assists: 0,
      previous_season_clean_sheets: 19,
      previous_season_red_cards: 0,
      previous_season_points: 162,
      previous_season_minutes: 3330,
    });
  });

  it('defaults missing history to zeroes', () => {
    expect(getPreviousSeasonStatistics(2, [])).toEqual({
      player_id: 2,
      previous_season_goals: 0,
      previous_season_assists: 0,
      previous_season_clean_sheets: 0,
      previous_season_red_cards: 0,
      previous_season_points: 0,
      previous_season_minutes: 0,
    });
  });
});
