import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import { prepareFplFixturesForSync } from '../utils/fplFixtures';

const FPL_FIXTURES_URL = 'https://fantasy.premierleague.com/api/fixtures/';

export default defineEventHandler(async (event) => {
  const expectedApiKey = process.env.SYNC_API_KEY;

  if (!expectedApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error',
    });
  }

  const apiKey = getHeader(event, 'x-api-key');
  if (!apiKey || apiKey !== expectedApiKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    const { data: clubs, error: clubsError } = await supabase
      .from('teams')
      .select('id');

    if (clubsError) {
      throw new Error(`Could not load imported clubs: ${clubsError.message}`);
    }

    const response = await fetch(FPL_FIXTURES_URL);
    if (!response.ok) {
      throw new Error(`FPL API responded with status: ${response.status}`);
    }

    const fixtures = prepareFplFixturesForSync(
      await response.json(),
      (clubs ?? []).map(club => club.id),
    );
    const { error: upsertError } = await supabase
      .from('fixtures')
      .upsert(fixtures, { onConflict: 'id' });

    if (upsertError) {
      throw new Error(`Database upsert failed: ${upsertError.message}`);
    }

    const { count, error: countError } = await supabase
      .from('fixtures')
      .select('*', { count: 'exact', head: true });

    if (countError || count !== fixtures.length) {
      throw new Error(
        `Fixture count validation failed: expected ${fixtures.length}, found ${count ?? 'unknown'}`,
      );
    }

    return {
      success: true,
      message: `Successfully synced ${fixtures.length} fixtures`,
      fixturesCount: fixtures.length,
    };
  }
  catch (error) {
    const errorMessage
      = error instanceof Error ? error.message : 'Unknown error occurred';

    throw createError({
      statusCode: 500,
      statusMessage: `Fixture sync failed: ${errorMessage}`,
    });
  }
});
