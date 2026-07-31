import { describe, expect, it } from 'vitest';
import { createMockFplFixtures } from '../factories';
import { prepareFplFixturesForSync } from '../../../server/utils/fplFixtures';

const CLUB_IDS = Array.from({ length: 20 }, (_, index) => index + 1);

describe('prepareFplFixturesForSync', () => {
  it('maps a complete FPL season to blank local fixtures', () => {
    const fixtures = prepareFplFixturesForSync(
      createMockFplFixtures(),
      CLUB_IDS,
    );

    expect(fixtures).toHaveLength(380);
    expect(fixtures[0]).toEqual({
      id: 1,
      game_week: 1,
      home_team: 1,
      away_team: 20,
      home_team_score: null,
      away_team_score: null,
    });
  });

  it('rejects a database without exactly 20 imported clubs', () => {
    expect(() => prepareFplFixturesForSync(
      createMockFplFixtures(),
      CLUB_IDS.slice(0, 19),
    )).toThrow('Database must contain exactly 20 unique FPL clubs');
  });

  it('rejects an incomplete fixture list', () => {
    expect(() => prepareFplFixturesForSync(
      createMockFplFixtures().slice(0, 379),
      CLUB_IDS,
    )).toThrow('FPL fixtures payload must contain exactly 380 fixtures');
  });

  it('accepts legitimate fixture rearrangements between gameweeks', () => {
    const fixtures = createMockFplFixtures();
    fixtures[0]!.event = 2;
    fixtures[190]!.event = 20;

    expect(prepareFplFixturesForSync(fixtures, CLUB_IDS)).toHaveLength(380);
  });
});
