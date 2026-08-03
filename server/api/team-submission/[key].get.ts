import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';
import {
  APP_SETTING_KEYS,
  isTeamRegistrationOpen,
  parseAppSettings,
} from '../../../shared/utils/appSettings';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key');

  if (!key || !UUID_PATTERN.test(key)) {
    throw createError({ statusCode: 404, statusMessage: 'No team found' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error' });
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  const { data: settingsData, error: settingsError } = await supabase
    .from('settings')
    .select('setting_key, setting_value')
    .in('setting_key', APP_SETTING_KEYS);

  if (settingsError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load application settings' });
  }

  let settings;
  try {
    settings = parseAppSettings(settingsData ?? []);
  }
  catch {
    throw createError({ statusCode: 500, statusMessage: 'Application settings are invalid' });
  }

  if (!isTeamRegistrationOpen(settings)) {
    throw createError({ statusCode: 403, statusMessage: 'Team registration is closed' });
  }

  const { data, error } = await supabase
    .from('drafted_teams')
    .select(`
      drafted_team_id,
      team_name,
      team_owner,
      team_email,
      allowed_transfers,
      active_season,
      created_at,
      updated_at,
      allow_communication,
      contact_number,
      edited_count,
      total_team_value,
      players:drafted_players(
        drafted_player_id,
        drafted_team,
        ...players_view(*)
      )
    `)
    .eq('key', key)
    .eq('active_season', settings.activeSeason)
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load team' });
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'No team found' });
  }

  return data;
});
