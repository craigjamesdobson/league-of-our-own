import { describe, expect, it } from 'vitest';
import { prepareFplPlayersForSync } from '../../../server/utils/fplPlayers';

describe('prepareFplPlayersForSync', () => {
  it('keeps FPL total points for the player reference view', () => {
    const [player] = prepareFplPlayersForSync({
      elements: [{
        id: 1,
        code: 1001,
        cost_change_event: 0,
        cost_change_start_fall: 0,
        cost_change_start: 0,
        element_type: 3,
        first_name: 'Test',
        news: '',
        news_added: null,
        now_cost: 50,
        photo: '1.jpg',
        second_name: 'Player',
        status: 'a',
        team: 1,
        team_code: 1,
        web_name: 'Test Player',
        minutes: 0,
        total_points: 42,
        goals_scored: 7,
        assists: 4,
        clean_sheets: 6,
        red_cards: 1,
      }],
    });

    expect(player).toMatchObject({
      player_id: 1,
      total_points: 42,
      goals_scored: 7,
      assists: 4,
      clean_sheets: 6,
      red_cards: 1,
    });
  });
});
