import { describe, expect, it } from 'vitest';
import {
  createMockFplPlayers,
  createMockFplFixtures,
  createMockFplTeams,
} from '~/tests/factories';
import { createFplDevelopmentSeed } from '../../../server/utils/fplDevelopmentSeed';

describe('createFplDevelopmentSeed', () => {
  it('creates the four curated squads and only enables transfers for two', () => {
    const elements = createMockFplPlayers();
    const seed = createFplDevelopmentSeed(
      { teams: createMockFplTeams(), elements },
      createMockFplFixtures(),
      4,
    );
    const playersById = new Map(elements.map(player => [player.id, player]));

    expect(seed.draftedTeams.map(team => ({
      name: team.team_name,
      transfersAllowed: team.allowed_transfers,
    }))).toEqual([
      { name: 'High Press XI', transfersAllowed: true },
      { name: 'Counter Attack XI', transfersAllowed: true },
      { name: 'Set Piece XI', transfersAllowed: false },
      { name: 'Possession XI', transfersAllowed: false },
    ]);

    expect(seed.draftedTeams.map(team =>
      seed.draftedPlayers
        .filter(player => player.drafted_team === team.drafted_team_id)
        .map(player => playersById.get(player.drafted_player)!.code)))
      .toEqual([
        [204936, 226597, 247348, 199796, 494521, 141746, 513418, 243298, 223094, 177815, 538207],
        [154561, 209036, 225796, 244723, 216051, 437730, 223340, 208706, 502500, 178301, 475168],
        [111234, 97032, 17761, 472769, 200834, 204480, 446008, 222531, 224117, 231747, 444102],
        [457569, 467779, 469142, 215136, 466075, 244851, 209244, 448047, 50175, 219168, 438234],
      ]);
  });

  it('creates the requested number of unique formation-valid squads', () => {
    const elements = createMockFplPlayers();
    const seed = createFplDevelopmentSeed(
      { teams: createMockFplTeams(), elements },
      createMockFplFixtures(),
      4,
    );

    expect(seed.draftedTeams).toHaveLength(4);
    expect(seed.draftedPlayers).toHaveLength(44);
    expect(new Set(seed.draftedPlayers.map(player => player.drafted_player)).size)
      .toBe(44);

    const positionsByPlayer = new Map(
      elements.map(player => [player.id, player.element_type]),
    );

    seed.draftedTeams.forEach((team) => {
      const formation = seed.draftedPlayers
        .filter(player => player.drafted_team === team.drafted_team_id)
        .map(player => positionsByPlayer.get(player.drafted_player))
        .sort();

      expect(formation).toEqual([1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
      expect(team.active_season).toBe('26-27');

      const expectedValue = seed.draftedPlayers
        .filter(player => player.drafted_team === team.drafted_team_id)
        .reduce((total, draftedPlayer) => {
          const transfer = seed.draftedTransfers.find(
            item => item.drafted_player === draftedPlayer.drafted_player_id,
          );
          const player = elements.find(
            element => element.id === (
              transfer?.player_id ?? draftedPlayer.drafted_player
            ),
          )!;
          return total + (player.now_cost / 10);
        }, 0);

      expect(team.total_team_value).toBe(expectedValue);
    });
  });

  it('rejects a dummy-team count outside the supported range', () => {
    const bootstrap = {
      teams: createMockFplTeams(),
      elements: createMockFplPlayers(),
    };

    const fixtures = createMockFplFixtures();

    expect(() => createFplDevelopmentSeed(bootstrap, fixtures, 0)).toThrow(
      'Dummy team count must be an integer from 1 to 12',
    );
    expect(() => createFplDevelopmentSeed(bootstrap, fixtures, 13)).toThrow(
      'Dummy team count must be an integer from 1 to 12',
    );
  });

  it('maps the official FPL clubs, players, and fixtures for database import', () => {
    const elements = createMockFplPlayers();
    const fixtures = createMockFplFixtures();
    const seed = createFplDevelopmentSeed(
      { teams: createMockFplTeams(), elements },
      fixtures,
      2,
    );

    expect(seed.teams).toHaveLength(20);
    expect(seed.teams[0]).toEqual({ id: 1, name: 'Club 1', short_name: 'C01' });
    expect(seed.players).toHaveLength(elements.length);
    expect(seed.players[0]).toMatchObject({
      player_id: 1,
      code: 204936,
      element_type: 1,
      team: 15,
      now_cost: 50,
    });
    expect(seed.fixtures).toHaveLength(380);
    expect(seed.fixtures[0]).toEqual({
      id: 1,
      game_week: 1,
      home_team: 1,
      away_team: 20,
      home_team_score: null,
      away_team_score: null,
    });
  });

  it('creates lightweight standings and transfer history for archive testing', () => {
    const seed = createFplDevelopmentSeed(
      {
        teams: createMockFplTeams(),
        elements: createMockFplPlayers(),
      },
      createMockFplFixtures(),
      4,
    );

    expect(seed.weeklyStatistics).toHaveLength(4 * 38);
    seed.draftedTeams.forEach((team) => {
      const weeks = seed.weeklyStatistics
        .filter(statistic => statistic.team === team.drafted_team_id)
        .map(statistic => statistic.week);
      expect(weeks).toEqual(Array.from({ length: 38 }, (_, index) => index + 1));
    });

    expect(seed.draftedTransfers).toHaveLength(2);
    expect(seed.draftedTransfers.map(transfer =>
      seed.draftedPlayers.find(
        player => player.drafted_player_id === transfer.drafted_player,
      )!.drafted_team)).toEqual([1, 2]);
    const initiallyDrafted = new Set(
      seed.draftedPlayers.map(player => player.drafted_player),
    );
    seed.draftedTransfers.forEach((transfer) => {
      expect(initiallyDrafted.has(transfer.player_id)).toBe(false);
      expect(transfer.transfer_week).toBeGreaterThanOrEqual(1);
      expect(transfer.transfer_week).toBeLessThanOrEqual(38);
    });

    expect(seed.settings).toEqual([
      { setting_key: 'active_season', setting_value: '26-27' },
      { setting_key: 'current_gameweek', setting_value: '1' },
      { setting_key: 'season_complete', setting_value: 'false' },
      { setting_key: 'site_open', setting_value: 'true' },
      { setting_key: 'league_data_public', setting_value: 'false' },
      { setting_key: 'team_registration_open', setting_value: 'true' },
    ]);
    expect(seed.fixtures.every(fixture =>
      fixture.home_team_score === null && fixture.away_team_score === null,
    )).toBe(true);
  });
});
