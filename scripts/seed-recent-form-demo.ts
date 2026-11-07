import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { assertLocalSupabaseUrl } from '../server/utils/localSupabase';
import { getRecentFormSummary } from '../app/logic/recent-form';

const WEEKS = 21;
const environment = new Map(Array.from(
  execFileSync('supabase', ['status', '-o', 'env'], { encoding: 'utf8' }).matchAll(/^([A-Z_]+)="(.*)"$/gm),
  match => [match[1]!, match[2]!],
));
const databaseUrl = environment.get('DB_URL');
const apiUrl = environment.get('API_URL');
if (!databaseUrl || !apiUrl) throw new Error('Start local Supabase before seeding Recent Form.');
assertLocalSupabaseUrl(databaseUrl);
assertLocalSupabaseUrl(apiUrl);

const query = (sql: string) => execFileSync('psql', [databaseUrl, '-X', '-A', '-t', '-v', 'ON_ERROR_STOP=1'], {
  input: sql, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
}).trim();
const metadataSchema = z.object({
  season: z.string().regex(/^\d{2}-\d{2}$/),
  teams: z.array(z.object({ drafted_team_id: z.number(), team_name: z.string(), team_owner: z.string(), team_email: z.string() })),
  players: z.array(z.object({ player_id: z.number(), position: z.number(), team: z.number(), minutes: z.number() })),
  squads: z.array(z.object({ drafted_player_id: z.number(), drafted_team: z.number(), drafted_player: z.number() })),
  transfers: z.array(z.object({ drafted_player: z.number(), transfer_week: z.number(), player_id: z.number(), drafted_transfer_id: z.number() })),
  fixtures: z.array(z.object({ id: z.number(), game_week: z.number(), home_team: z.number(), away_team: z.number() })),
  profiles: z.array(z.object({ id: z.string().uuid(), username: z.string() })),
});
const metadata = metadataSchema.parse(JSON.parse(query(`
  select json_build_object(
    'season', (select setting_value from public.settings where setting_key = 'active_season'),
    'teams', (select coalesce(json_agg(t), '[]') from (
      select drafted_team_id, team_name, team_owner, team_email from public.drafted_teams
      where active_season = (select setting_value from public.settings where setting_key = 'active_season') order by drafted_team_id
    ) t),
    'players', (select coalesce(json_agg(p), '[]') from (
      select player_id, position, team, coalesce(minutes, 0) as minutes from public.players_view order by player_id
    ) p),
    'squads', (select coalesce(json_agg(dp), '[]') from (
      select dp.drafted_player_id, dp.drafted_team, dp.drafted_player from public.drafted_players dp join public.drafted_teams dt on dt.drafted_team_id = dp.drafted_team
      where dt.active_season = (select setting_value from public.settings where setting_key = 'active_season')
    ) dp),
    'transfers', (select coalesce(json_agg(t), '[]') from (
      select drafted_player, transfer_week, player_id, drafted_transfer_id from public.drafted_transfers
    ) t),
    'fixtures', (select coalesce(json_agg(f), '[]') from (
      select id, game_week, home_team, away_team from public.fixtures where game_week between 1 and ${WEEKS} order by id
    ) f),
    'profiles', (select coalesce(json_agg(p), '[]') from (select id, username from public.profiles where username in ('local-admin-1', 'local-admin-2')) p)
  );
`)));
if (metadata.teams.length < 4 || metadata.teams.some(team => !team.team_email.endsWith('@local.test'))) {
  throw new Error('This seed requires at least four existing local.test demo teams. It does not replace real league squads.');
}
const author = metadata.profiles.find(profile => profile.username === 'local-admin-1')?.id;
const verifier = metadata.profiles.find(profile => profile.username === 'local-admin-2')?.id;
if (!author || !verifier) throw new Error('This seed requires the existing two local development admins.');
if (Array.from({ length: WEEKS }, (_, index) => index + 1).some(week => !metadata.fixtures.some(fixture => fixture.game_week === week))) {
  throw new Error('Fixtures must already exist for all 21 demo gameweeks.');
}

const selectedPlayer = (slot: typeof metadata.squads[number], week: number) => metadata.transfers
  .filter(transfer => transfer.drafted_player === slot.drafted_player_id && transfer.transfer_week <= week)
  .toSorted((a, b) => b.transfer_week - a.transfer_week || b.drafted_transfer_id - a.drafted_transfer_id)[0]?.player_id ?? slot.drafted_player;
const squadsByWeek = new Map(Array.from({ length: WEEKS }, (_, index) => {
  const week = index + 1;
  return [week, metadata.teams.map(team => ({
    id: team.drafted_team_id,
    players: metadata.squads.filter(slot => slot.drafted_team === team.drafted_team_id).map(slot => selectedPlayer(slot, week)),
  }))];
}));
const lineups = new Map(Array.from(new Set(metadata.players.map(player => player.team)), club => [club,
  [1, 2, 3, 4].flatMap(position => metadata.players.filter(player => player.team === club && player.position === position)
    .toSorted((a, b) => b.minutes - a.minutes || a.player_id - b.player_id)
    .slice(0, position === 1 ? 1 : position === 2 ? 4 : position === 3 ? 4 : 2)),
]));

type PlayerStat = {
  player_id: number;
  fixture_id: number;
  goals: number;
  assists: number;
  clean_sheet: boolean;
  red_card: boolean;
  points: number;
};
const points = (position: number, goals: number, assists: number, cleanSheet: boolean, redCard: boolean) =>
  goals * (position === 1 ? 10 : position === 2 ? 7 : position === 3 ? 5 : 3)
  + assists * 3 + (goals === 2 ? 5 : goals >= 3 ? 10 : 0)
  + (cleanSheet ? position === 1 ? 5 : position === 2 ? 2 : 0 : 0) - (redCard ? 10 : 0);

const simulate = (seed: number) => {
  let state = seed;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const stats: PlayerStat[] = metadata.fixtures.flatMap((fixture) => {
    const homeGoals = Math.floor(random() * 5);
    const awayGoals = Math.floor(random() * 5);
    return [
      { club: fixture.home_team, goals: homeGoals, conceded: awayGoals },
      { club: fixture.away_team, goals: awayGoals, conceded: homeGoals },
    ].flatMap((side) => {
      const lineup = lineups.get(side.club) ?? [];
      const outfield = lineup.filter(player => player.position !== 1);
      if (!lineup.some(player => player.position === 1) || !outfield.length) throw new Error(`Missing club lineup ${side.club}`);
      const weight = (player: typeof lineup[number]) => {
        const ownership = squadsByWeek.get(fixture.game_week) ?? [];
        const hasPlayer = (index: number) => ownership[index]?.players.includes(player.player_id) ?? false;
        const form = hasPlayer(2)
          ? (fixture.game_week <= 11 ? 0.4 : 3)
          : hasPlayer(1)
            ? 1.8
            : hasPlayer(0)
              ? (fixture.game_week >= 17 && fixture.game_week % 3 === 0 ? 5 : 0.8)
              : hasPlayer(3) ? (fixture.game_week >= 17 ? 2.4 : 0.7) : 1;
        return (player.position === 4 ? 3 : player.position === 3 ? 2 : 0.6) * form;
      };
      const pick = (candidates: typeof outfield) => {
        const target = random() * candidates.reduce((sum, player) => sum + weight(player), 0);
        return candidates.find((_, index) => candidates.slice(0, index + 1).reduce((sum, player) => sum + weight(player), 0) > target) ?? candidates[0]!;
      };
      const events = Array.from({ length: side.goals }, () => {
        const scorer = pick(outfield);
        const assistant = random() > 0.18 ? pick(outfield.filter(player => player.player_id !== scorer.player_id)) : null;
        return { scorer: scorer.player_id, assistant: assistant?.player_id };
      });
      const redCardPlayer = random() < 0.08 ? outfield[Math.floor(random() * outfield.length)]?.player_id : null;
      return lineup.map((player): PlayerStat => {
        const goals = events.filter(event => event.scorer === player.player_id).length;
        const assists = events.filter(event => event.assistant === player.player_id).length;
        const redCard = redCardPlayer === player.player_id;
        const cleanSheet = side.conceded === 0 && player.position <= 2 && !redCard;
        return {
          player_id: player.player_id, fixture_id: fixture.id, goals, assists, clean_sheet: cleanSheet, red_card: redCard,
          points: points(player.position, goals, assists, cleanSheet, redCard),
        };
      }).filter(stat => stat.goals || stat.assists || stat.clean_sheet || stat.red_card);
    });
  });
  const fixtures = metadata.fixtures.map(fixture => ({
    ...fixture,
    home_team_score: stats.filter(stat => stat.fixture_id === fixture.id && metadata.players.find(player => player.player_id === stat.player_id)?.team === fixture.home_team).reduce((sum, stat) => sum + stat.goals, 0),
    away_team_score: stats.filter(stat => stat.fixture_id === fixture.id && metadata.players.find(player => player.player_id === stat.player_id)?.team === fixture.away_team).reduce((sum, stat) => sum + stat.goals, 0),
    verified_at: '2026-10-09T12:00:00Z', verified_by: verifier,
  }));
  const fixtureWeeks = new Map(fixtures.map(fixture => [fixture.id, fixture.game_week]));
  const weekly = metadata.teams.flatMap(team => Array.from({ length: WEEKS }, (_, index) => {
    const week = index + 1;
    const squad = squadsByWeek.get(week)?.find(squad => squad.id === team.drafted_team_id)?.players ?? [];
    const contributions = stats.filter(stat => fixtureWeeks.get(stat.fixture_id) === week && squad.includes(stat.player_id));
    return {
      team: team.drafted_team_id, week,
      points: contributions.reduce((sum, stat) => sum + stat.points, 0),
      goals: contributions.reduce((sum, stat) => sum + stat.goals, 0),
      assists: contributions.reduce((sum, stat) => sum + stat.assists, 0),
      clean_sheets: contributions.filter(stat => stat.clean_sheet).length,
      red_cards: contributions.filter(stat => stat.red_card).length,
    };
  }));
  const summaries = [3, 5, 10].map(period => getRecentFormSummary({
    teams: metadata.teams, scores: weekly, fixtures, currentGameweek: WEEKS,
    period: period === 3 ? 3 : period === 5 ? 5 : 10,
  }));
  const variety = summaries.reduce((sum, summary) => sum + new Set([
    summary.inForm[0]?.drafted_team_id, summary.improved[0]?.drafted_team_id,
    summary.regularScorers[0]?.drafted_team_id, summary.climbers[0]?.drafted_team_id,
  ].filter(id => id !== undefined)).size, 0);
  const usable = summaries.every(summary => summary.improved.length && summary.climbers.length && summary.regularScorers.length);
  return { seed, stats, fixtures, weekly, summaries, variety: usable ? variety : 0 };
};

let demo = simulate(1);
for (let seed = 2; seed <= 80 && demo.variety < 11; seed += 1) {
  const candidate = simulate(seed);
  if (candidate.variety > demo.variety) demo = candidate;
}
if (!demo.variety) throw new Error('Could not generate useful comparisons for these squads.');

const backupDirectory = '.scratch/recent-form-demo';
mkdirSync(backupDirectory, { recursive: true, mode: 0o700 });
const backupPath = `${backupDirectory}/before-seed-${new Date().toISOString().replaceAll(':', '-')}.json`;
writeFileSync(backupPath, query(`
  select json_build_object(
    'fixtures', (select coalesce(json_agg(f), '[]') from public.fixtures f),
    'player_statistics', (select coalesce(json_agg(p), '[]') from public.player_statistics p),
    'weekly_statistics', (select coalesce(json_agg(w), '[]') from public.weekly_statistics w),
    'settings', (select coalesce(json_agg(s), '[]') from public.settings s)
  );
`) + '\n', { mode: 0o600 });
const literal = (value: unknown) => `'${JSON.stringify(value).replaceAll('\'', '\'\'')}'::jsonb`;
query(`
  begin;
  create temporary table demo_stats as select * from jsonb_to_recordset(${literal(demo.stats)}) as s(player_id integer, fixture_id bigint, goals integer, assists integer, clean_sheet boolean, red_card boolean, points integer);
  create temporary table demo_fixtures as select * from jsonb_to_recordset(${literal(demo.fixtures)}) as f(id bigint, home_team_score integer, away_team_score integer);
  create temporary table demo_weekly as select * from jsonb_to_recordset(${literal(demo.weekly)}) as w(team integer, week integer, points integer, goals integer, assists integer, clean_sheets integer, red_cards integer);
  delete from public.player_statistics where fixture_id in (select id from demo_fixtures);
  insert into public.player_statistics(player_id, fixture_id, goals, assists, clean_sheet, red_card, points, author)
    select player_id, fixture_id, goals, assists, clean_sheet, red_card, points, '${author}'::uuid from demo_stats;
  update public.fixtures f set home_team_score = d.home_team_score, away_team_score = d.away_team_score,
    populated_by = '${author}'::uuid, populated_at = '2026-10-09T11:00:00Z',
    verified_by = '${verifier}'::uuid, verified_at = '2026-10-09T12:00:00Z'
    from demo_fixtures d where f.id = d.id;
  delete from public.weekly_statistics where team in (select drafted_team_id from public.drafted_teams where active_season = '${metadata.season}');
  insert into public.weekly_statistics(team, week, points, goals, assists, clean_sheets, red_cards)
    select team, week, points, goals, assists, clean_sheets, red_cards from demo_weekly;
  insert into public.settings(setting_key, setting_value) values
    ('current_gameweek', '${WEEKS}'), ('site_open', 'true'), ('league_data_public', 'true'),
    ('team_registration_open', 'false'), ('season_complete', 'false')
    on conflict (setting_key) do update set setting_value = excluded.setting_value;
  commit;
`);
console.log(`Seeded ${metadata.teams.length} existing demo teams, ${WEEKS} verified gameweeks and ${demo.stats.length} player-stat rows (simulation ${demo.seed}).`);
console.log(`Previous local scoring data saved to ${backupPath}.`);
for (const [index, summary] of demo.summaries.entries()) {
  console.log(`Last ${[3, 5, 10][index]} weeks: form ${summary.inForm.map(team => team.team_name).join(', ')}; improved ${summary.improved.map(team => team.team_name).join(', ')}; regular ${summary.regularScorers.map(team => team.team_name).join(', ')}; climber ${summary.climbers.map(team => team.team_name).join(', ')}.`);
}
