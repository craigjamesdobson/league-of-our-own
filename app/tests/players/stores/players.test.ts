import { describe, expect, it } from 'vitest';
import { createMockPlayer } from '@/tests/factories/players';
import {
  aggregatePlayerStatistics,
  mergePlayersWithSeasonStatistics,
} from '@/stores/players';

describe('mergePlayersWithSeasonStatistics', () => {
  it('uses app-owned player_statistics totals for displayed player stats', () => {
    const player = createMockPlayer({
      player_id: 1,
      goals_scored: 99,
      assists: 99,
      clean_sheets: 99,
      red_cards: 99,
    });

    const [result] = mergePlayersWithSeasonStatistics([player], [
      {
        player_id: 1,
        goals: 2,
        assists: 1,
        clean_sheet: true,
        red_card: false,
        points: 13,
      },
      {
        player_id: 1,
        goals: 1,
        assists: null,
        clean_sheet: false,
        red_card: true,
        points: 5,
      },
    ]);

    expect(result).toMatchObject({
      player_id: 1,
      goals_scored: 99,
      assists: 99,
      clean_sheets: 99,
      red_cards: 99,
      season_goals: 3,
      season_assists: 1,
      season_clean_sheets: 1,
      season_red_cards: 1,
      season_points: 18,
    });
  });

  it('defaults season statistics to zero when a player has no statistics rows', () => {
    const [result] = mergePlayersWithSeasonStatistics([
      createMockPlayer({ player_id: 2 }),
    ], []);

    expect(result).toMatchObject({
      player_id: 2,
      season_goals: 0,
      season_assists: 0,
      season_clean_sheets: 0,
      season_red_cards: 0,
      season_points: 0,
    });
  });
});

describe('aggregatePlayerStatistics', () => {
  it('treats null numeric values as zero and false booleans as no event', () => {
    const totals = aggregatePlayerStatistics([
      {
        player_id: 3,
        goals: null,
        assists: null,
        clean_sheet: null,
        red_card: false,
        points: 0,
      },
    ]);

    expect(totals.get(3)).toEqual({
      season_goals: 0,
      season_assists: 0,
      season_clean_sheets: 0,
      season_red_cards: 0,
      season_points: 0,
    });
  });
});
