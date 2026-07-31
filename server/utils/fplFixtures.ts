export interface FplFixture {
  id: number;
  event: number;
  team_h: number;
  team_a: number;
}

export interface FixtureForSync {
  id: number;
  game_week: number;
  home_team: number;
  away_team: number;
  home_team_score: null;
  away_team_score: null;
}

const EXPECTED_CLUB_COUNT = 20;
const EXPECTED_GAMEWEEK_COUNT = 38;
const EXPECTED_FIXTURE_COUNT = 380;

export const prepareFplFixturesForSync = (
  payload: unknown,
  clubIds: number[],
): FixtureForSync[] => {
  if (
    clubIds.length !== EXPECTED_CLUB_COUNT
    || new Set(clubIds).size !== EXPECTED_CLUB_COUNT
    || clubIds.some(clubId => !Number.isInteger(clubId) || clubId <= 0)
  ) {
    throw new Error('Database must contain exactly 20 unique FPL clubs');
  }

  if (!Array.isArray(payload) || payload.length !== EXPECTED_FIXTURE_COUNT) {
    throw new Error('FPL fixtures payload must contain exactly 380 fixtures');
  }

  const validClubIds = new Set(clubIds);
  const fixtureIds = new Set<number>();
  const directedPairings = new Set<string>();
  const pairingCounts = new Map<string, number>();

  const fixtures = payload.map((value, index): FixtureForSync => {
    if (typeof value !== 'object' || value === null) {
      throw new Error(`FPL fixture at index ${index} is invalid`);
    }

    const fixture = value as Partial<FplFixture>;
    if (
      !Number.isInteger(fixture.id)
      || Number(fixture.id) <= 0
      || fixtureIds.has(Number(fixture.id))
    ) {
      throw new Error('FPL fixtures must have unique positive integer ids');
    }
    if (
      !Number.isInteger(fixture.event)
      || Number(fixture.event) < 1
      || Number(fixture.event) > EXPECTED_GAMEWEEK_COUNT
    ) {
      throw new Error(`FPL fixture ${fixture.id} has an invalid event`);
    }
    if (
      !validClubIds.has(Number(fixture.team_h))
      || !validClubIds.has(Number(fixture.team_a))
      || fixture.team_h === fixture.team_a
    ) {
      throw new Error(`FPL fixture ${fixture.id} references invalid clubs`);
    }

    const id = Number(fixture.id);
    const gameweek = Number(fixture.event);
    const homeTeam = Number(fixture.team_h);
    const awayTeam = Number(fixture.team_a);
    const directedPairing = `${homeTeam}-${awayTeam}`;
    const pairing = [homeTeam, awayTeam].sort((left, right) => left - right).join('-');

    if (directedPairings.has(directedPairing)) {
      throw new Error(`FPL fixtures contain duplicate pairing ${directedPairing}`);
    }

    fixtureIds.add(id);
    directedPairings.add(directedPairing);
    pairingCounts.set(pairing, (pairingCounts.get(pairing) ?? 0) + 1);
    return {
      id,
      game_week: gameweek,
      home_team: homeTeam,
      away_team: awayTeam,
      home_team_score: null,
      away_team_score: null,
    };
  });

  if (
    pairingCounts.size !== (EXPECTED_CLUB_COUNT * (EXPECTED_CLUB_COUNT - 1)) / 2
    || [...pairingCounts.values()].some(count => count !== 2)
  ) {
    throw new Error('Every pair of FPL clubs must have one home and one away fixture');
  }

  return fixtures;
};
