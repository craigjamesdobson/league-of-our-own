import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import { fetchPreviousSeasonStatistics } from '../utils/fplPreviousSeason';

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

    const statistics = await fetchPreviousSeasonStatistics();
    const syncedAt = new Date().toISOString();
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    const { error } = await supabase
      .from('player_previous_season_statistics')
      .upsert(
        statistics.map(statistic => ({
          player_id: statistic.player_id,
          season_name: statistic.season_name,
          minutes: statistic.previous_season_minutes,
          goals: statistic.previous_season_goals,
          assists: statistic.previous_season_assists,
          clean_sheets: statistic.previous_season_clean_sheets,
          red_cards: statistic.previous_season_red_cards,
          points: statistic.previous_season_points,
          synced_at: syncedAt,
        })),
        { onConflict: 'player_id' },
      );

    if (error) {
      throw new Error(`Database upsert failed: ${error.message}`);
    }

    return {
      success: true,
      message: `Successfully synced previous-season statistics for ${statistics.length} players`,
      statsCount: statistics.length,
    };
  }
  catch (error) {
    const errorMessage
      = error instanceof Error ? error.message : 'Unknown error occurred';

    throw createError({
      statusCode: 500,
      statusMessage: `Previous-season player statistics sync failed: ${errorMessage}`,
    });
  }
});
