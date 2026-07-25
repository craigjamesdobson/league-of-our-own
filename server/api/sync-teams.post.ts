import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import { prepareFplTeamsForSync } from '../utils/fplTeams';

const FPL_BOOTSTRAP_URL
  = 'https://fantasy.premierleague.com/api/bootstrap-static';

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

    const response = await fetch(FPL_BOOTSTRAP_URL);

    if (!response.ok) {
      throw new Error(`FPL API responded with status: ${response.status}`);
    }

    const teams = prepareFplTeamsForSync(await response.json());
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    const { error } = await supabase
      .from('teams')
      .upsert(teams, { onConflict: 'id' });

    if (error) {
      throw new Error(`Database upsert failed: ${error.message}`);
    }

    return {
      success: true,
      message: `Successfully synced ${teams.length} teams`,
      teamsCount: teams.length,
      teams,
    };
  }
  catch (error) {
    const errorMessage
      = error instanceof Error ? error.message : 'Unknown error occurred';

    throw createError({
      statusCode: 500,
      statusMessage: `Team sync failed: ${errorMessage}`,
    });
  }
});
