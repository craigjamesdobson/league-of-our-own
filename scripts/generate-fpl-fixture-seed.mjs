import { writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const FPL_FIXTURES_URL = 'https://fantasy.premierleague.com/api/fixtures/';
const OUTPUT_URL = new URL(
  '../supabase/fixtures/fpl-2026-27-fixtures.sql',
  import.meta.url,
);

const assertIntegerBetween = (value, minimum, maximum, description) => {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${description} must be an integer from ${minimum} to ${maximum}`);
  }
};

export const validateFplFixtures = (fixtures) => {
  if (!Array.isArray(fixtures)) {
    throw new Error('FPL fixtures response must be an array');
  }

  if (fixtures.length !== 380) {
    throw new Error(`Expected 380 FPL fixtures; received ${fixtures.length}`);
  }

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

    assertIntegerBetween(fixture.id, 1, 380, `Fixture at index ${index} id`);
    assertIntegerBetween(fixture.event, 1, 38, `Fixture ${fixture.id} event`);
    assertIntegerBetween(fixture.team_h, 1, 20, `Fixture ${fixture.id} home team`);
    assertIntegerBetween(fixture.team_a, 1, 20, `Fixture ${fixture.id} away team`);

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
    if (eventCounts.get(event) !== 10) {
      throw new Error(`FPL event ${event} must contain exactly 10 fixtures`);
    }
    if (eventClubs.get(event)?.size !== 20) {
      throw new Error(`Every FPL club must appear exactly once in event ${event}`);
    }
  }

  for (let club = 1; club <= 20; club += 1) {
    if (clubHomeCounts.get(club) !== 19 || clubAwayCounts.get(club) !== 19) {
      throw new Error(`FPL club ${club} must have 19 home and 19 away fixtures`);
    }
  }

  if (pairings.size !== 190 || [...pairings.values()].some(count => count !== 2)) {
    throw new Error('Every pair of FPL clubs must appear in exactly two fixtures');
  }
};

const sqlValue = value => value === null ? 'null' : String(value);

export const renderFplFixtureSeed = (fixtures) => {
  validateFplFixtures(fixtures);

  const rows = [...fixtures]
    .sort((left, right) => left.id - right.id)
    .map(fixture =>
      `  (${fixture.id}, ${fixture.event}, ${fixture.team_h}, ${fixture.team_a}, ${sqlValue(fixture.team_h_score)}, ${sqlValue(fixture.team_a_score)})`,
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
  const response = await fetch(FPL_FIXTURES_URL);

  if (!response.ok) {
    throw new Error(`FPL fixtures request failed with status ${response.status}`);
  }

  const fixtures = await response.json();
  const sql = renderFplFixtureSeed(fixtures);
  await writeFile(OUTPUT_URL, sql, 'utf8');
  console.log(`Generated ${fixtures.length} fixtures at ${fileURLToPath(OUTPUT_URL)}`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateFixtureSeed();
}
