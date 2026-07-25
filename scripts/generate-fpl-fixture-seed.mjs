import { writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const FPL_FIXTURES_URL = 'https://fantasy.premierleague.com/api/fixtures/';
const FPL_BOOTSTRAP_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';
const OUTPUT_URL = new URL(
  '../supabase/fixtures/fpl-2026-27-fixtures.sql',
  import.meta.url,
);

const assertIntegerBetween = (value, minimum, maximum, description) => {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${description} must be an integer from ${minimum} to ${maximum}`);
  }
};

export const validateFplFixtures = (fixtures, clubIds) => {
  if (!Array.isArray(fixtures)) {
    throw new Error('FPL fixtures response must be an array');
  }

  if (
    !Array.isArray(clubIds)
    || clubIds.length !== 20
    || new Set(clubIds).size !== 20
    || clubIds.some(clubId => !Number.isInteger(clubId) || clubId <= 0)
  ) {
    throw new Error('FPL bootstrap response must contain 20 unique club ids');
  }

  const expectedFixtureCount = clubIds.length * (clubIds.length - 1);
  if (fixtures.length !== expectedFixtureCount) {
    throw new Error(
      `Expected ${expectedFixtureCount} FPL fixtures; received ${fixtures.length}`,
    );
  }

  const validClubIds = new Set(clubIds);
  const fixtureIds = new Set();
  const eventCounts = new Map();
  const clubHomeCounts = new Map();
  const clubAwayCounts = new Map();
  const eventClubs = new Map();
  const pairings = new Map();
  const directedPairings = new Set();

  fixtures.forEach((fixture, index) => {
    if (typeof fixture !== 'object' || fixture === null) {
      throw new Error(`Fixture at index ${index} must be an object`);
    }

    if (!Number.isInteger(fixture.id) || fixture.id <= 0) {
      throw new Error(`Fixture at index ${index} id must be a positive integer`);
    }
    assertIntegerBetween(fixture.event, 1, 38, `Fixture ${fixture.id} event`);
    if (!validClubIds.has(fixture.team_h) || !validClubIds.has(fixture.team_a)) {
      throw new Error(`Fixture ${fixture.id} references an unknown FPL club id`);
    }

    if (fixture.team_h === fixture.team_a) {
      throw new Error(`Fixture ${fixture.id} cannot have the same home and away club`);
    }
    if (fixtureIds.has(fixture.id)) {
      throw new Error(`Duplicate FPL fixture id ${fixture.id}`);
    }
    if (
      ![fixture.team_h_score, fixture.team_a_score]
        .every(score => score === null || Number.isInteger(score))
    ) {
      throw new Error(`Fixture ${fixture.id} scores must be integers or null`);
    }

    fixtureIds.add(fixture.id);
    eventCounts.set(fixture.event, (eventCounts.get(fixture.event) ?? 0) + 1);
    const clubsInEvent = eventClubs.get(fixture.event) ?? new Set();
    clubsInEvent.add(fixture.team_h);
    clubsInEvent.add(fixture.team_a);
    eventClubs.set(fixture.event, clubsInEvent);
    clubHomeCounts.set(
      fixture.team_h,
      (clubHomeCounts.get(fixture.team_h) ?? 0) + 1,
    );
    clubAwayCounts.set(
      fixture.team_a,
      (clubAwayCounts.get(fixture.team_a) ?? 0) + 1,
    );

    const pairingKey = [fixture.team_h, fixture.team_a].sort((a, b) => a - b).join('-');
    pairings.set(pairingKey, (pairings.get(pairingKey) ?? 0) + 1);
    const directedPairingKey = `${fixture.team_h}-${fixture.team_a}`;
    if (directedPairings.has(directedPairingKey)) {
      throw new Error(`Duplicate home/away pairing ${directedPairingKey}`);
    }
    directedPairings.add(directedPairingKey);
  });

  for (let event = 1; event <= 38; event += 1) {
    const expectedFixturesPerEvent = clubIds.length / 2;
    if (eventCounts.get(event) !== expectedFixturesPerEvent) {
      throw new Error(
        `FPL event ${event} must contain exactly ${expectedFixturesPerEvent} fixtures`,
      );
    }
    if (eventClubs.get(event)?.size !== clubIds.length) {
      throw new Error(`Every FPL club must appear exactly once in event ${event}`);
    }
  }

  const expectedFixturesPerVenue = clubIds.length - 1;
  clubIds.forEach((club) => {
    if (
      clubHomeCounts.get(club) !== expectedFixturesPerVenue
      || clubAwayCounts.get(club) !== expectedFixturesPerVenue
    ) {
      throw new Error(
        `FPL club ${club} must have ${expectedFixturesPerVenue} home and away fixtures`,
      );
    }
  });

  const expectedPairingCount = expectedFixtureCount / 2;
  if (
    pairings.size !== expectedPairingCount
    || [...pairings.values()].some(count => count !== 2)
  ) {
    throw new Error('Every pair of FPL clubs must appear in exactly two fixtures');
  }
};

export const renderFplFixtureSeed = (fixtures, clubIds) => {
  validateFplFixtures(fixtures, clubIds);

  const rows = [...fixtures]
    .sort((left, right) => left.id - right.id)
    .map(fixture =>
      `  (${fixture.id}, ${fixture.event}, ${fixture.team_h}, ${fixture.team_a}, null, null)`,
    );

  return `-- Generated from ${FPL_FIXTURES_URL}
-- Premier League 2026/27 fixture-to-gameweek assignments.
-- Kickoff times are intentionally omitted because public.fixtures does not store them.

insert into public.fixtures (
  id,
  game_week,
  home_team,
  away_team,
  home_team_score,
  away_team_score
)
values
${rows.join(',\n')}
on conflict (id) do update set
  game_week = excluded.game_week,
  home_team = excluded.home_team,
  away_team = excluded.away_team,
  home_team_score = excluded.home_team_score,
  away_team_score = excluded.away_team_score;

select setval(
  pg_get_serial_sequence('public.fixtures', 'id'),
  (select max(id) from public.fixtures),
  true
);
`;
};

const generateFixtureSeed = async () => {
  const [fixturesResponse, bootstrapResponse] = await Promise.all([
    fetch(FPL_FIXTURES_URL),
    fetch(FPL_BOOTSTRAP_URL),
  ]);

  if (!fixturesResponse.ok) {
    throw new Error(
      `FPL fixtures request failed with status ${fixturesResponse.status}`,
    );
  }
  if (!bootstrapResponse.ok) {
    throw new Error(
      `FPL bootstrap request failed with status ${bootstrapResponse.status}`,
    );
  }

  const fixtures = await fixturesResponse.json();
  const bootstrap = await bootstrapResponse.json();
  const clubIds = Array.isArray(bootstrap?.teams)
    ? bootstrap.teams.map(team => team?.id)
    : [];
  const sql = renderFplFixtureSeed(fixtures, clubIds);
  await writeFile(OUTPUT_URL, sql, 'utf8');
  console.log(`Generated ${fixtures.length} fixtures at ${fileURLToPath(OUTPUT_URL)}`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateFixtureSeed();
}
