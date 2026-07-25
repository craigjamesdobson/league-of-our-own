import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import {
  createFplDevelopmentSeed,
  type FplSeedBootstrap,
  type FplSeedFixture,
} from '../server/utils/fplDevelopmentSeed';
import { assertLocalSupabaseUrl } from '../server/utils/localSupabase';

const FPL_BOOTSTRAP_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';
const FPL_FIXTURES_URL = 'https://fantasy.premierleague.com/api/fixtures/';

const LOCAL_ADMINS = [
  {
    email: 'admin1@local.test',
    password: 'LocalAdmin1!2026',
    fullName: 'Local Admin 1',
    username: 'local-admin-1',
  },
  {
    email: 'admin2@local.test',
    password: 'LocalAdmin2!2026',
    fullName: 'Local Admin 2',
    username: 'local-admin-2',
  },
] as const;

const parseTeamCount = (args: string[]): number => {
  const equalsArgument = args.find(argument => argument.startsWith('--teams='));
  const separateIndex = args.indexOf('--teams');
  const rawValue = equalsArgument?.split('=')[1]
    ?? (separateIndex >= 0 ? args[separateIndex + 1] : undefined)
    ?? '4';

  return Number(rawValue);
};

const readLocalSupabaseEnvironment = () => {
  const output = execFileSync('supabase', ['status', '-o', 'env'], {
    encoding: 'utf8',
  });
  const environment = new Map<string, string>();

  for (const match of output.matchAll(/^([A-Z_]+)="(.*)"$/gm)) {
    environment.set(match[1]!, match[2]!);
  }

  const apiUrl = environment.get('API_URL');
  const databaseUrl = environment.get('DB_URL');
  const serviceRoleKey = environment.get('SERVICE_ROLE_KEY');

  if (!apiUrl || !databaseUrl || !serviceRoleKey) {
    throw new Error('Could not read local Supabase URLs and service-role key');
  }

  assertLocalSupabaseUrl(apiUrl);
  assertLocalSupabaseUrl(databaseUrl);

  return { apiUrl, databaseUrl, serviceRoleKey };
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} responded with status ${response.status}`);
  }
  return await response.json() as T;
};

const resetIdentitySequences = (databaseUrl: string) => {
  const sql = `
    select setval(
      pg_get_serial_sequence('public.drafted_teams', 'drafted_team_id'),
      coalesce((select max(drafted_team_id) from public.drafted_teams), 1),
      exists(select 1 from public.drafted_teams)
    );
    select setval(
      pg_get_serial_sequence('public.drafted_players', 'drafted_player_id'),
      coalesce((select max(drafted_player_id) from public.drafted_players), 1),
      exists(select 1 from public.drafted_players)
    );
    select setval(
      pg_get_serial_sequence('public.drafted_transfers', 'drafted_transfer_id'),
      coalesce((select max(drafted_transfer_id) from public.drafted_transfers), 1),
      exists(select 1 from public.drafted_transfers)
    );
    select setval(
      pg_get_serial_sequence('public.fixtures', 'id'),
      coalesce((select max(id) from public.fixtures), 1),
      exists(select 1 from public.fixtures)
    );
    select setval(
      pg_get_serial_sequence('public.weekly_statistics', 'id'),
      coalesce((select max(id) from public.weekly_statistics), 1),
      exists(select 1 from public.weekly_statistics)
    );
  `;

  execFileSync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-c', sql], {
    stdio: 'ignore',
  });
};

const seedFplDevelopment = async () => {
  const teamCount = parseTeamCount(process.argv.slice(2));
  const { apiUrl, databaseUrl, serviceRoleKey }
    = readLocalSupabaseEnvironment();

  console.log('Fetching official FPL clubs, players, and fixtures...');
  const [bootstrap, fixtures] = await Promise.all([
    fetchJson<FplSeedBootstrap>(FPL_BOOTSTRAP_URL),
    fetchJson<FplSeedFixture[]>(FPL_FIXTURES_URL),
  ]);
  const seed = createFplDevelopmentSeed(bootstrap, fixtures, teamCount);
  const supabase = createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const upsertRows = async (
    table: string,
    rows: object[],
    onConflict?: string,
  ) => {
    const { error } = await supabase.from(table).upsert(
      rows,
      onConflict ? { onConflict } : undefined,
    );
    if (error) {
      throw new Error(`Failed to seed ${table}: ${error.message}`);
    }
  };

  await upsertRows('teams', seed.teams, 'id');
  await upsertRows('players', seed.players, 'player_id');
  await upsertRows('fixtures', seed.fixtures, 'id');
  await upsertRows('settings', seed.settings, 'setting_key');
  await upsertRows('drafted_teams', seed.draftedTeams, 'drafted_team_id');
  await upsertRows('drafted_players', seed.draftedPlayers, 'drafted_player_id');
  await upsertRows(
    'drafted_transfers',
    seed.draftedTransfers,
    'drafted_transfer_id',
  );
  await upsertRows('weekly_statistics', seed.weeklyStatistics);

  for (const localAdmin of LOCAL_ADMINS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: localAdmin.email,
      password: localAdmin.password,
      email_confirm: true,
      user_metadata: { full_name: localAdmin.fullName },
    });
    if (error || !data.user) {
      throw new Error(
        `Failed to create ${localAdmin.email}: ${error?.message ?? 'no user returned'}`,
      );
    }

    await upsertRows('profiles', [{
      id: data.user.id,
      full_name: localAdmin.fullName,
      username: localAdmin.username,
    }], 'id');
  }

  resetIdentitySequences(databaseUrl);

  console.log(`Seeded ${seed.teams.length} clubs and ${seed.players.length} players.`);
  console.log(`Seeded ${seed.fixtures.length} fixtures and ${teamCount} dummy teams.`);
  console.log('Local fixture workflow users:');
  LOCAL_ADMINS.forEach(admin =>
    console.log(`  ${admin.email} / ${admin.password}`),
  );
};

await seedFplDevelopment();
