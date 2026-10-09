import { createClient } from '@supabase/supabase-js';
import { getRequestIP, readBody, setResponseHeader } from 'h3';
import { z } from 'zod';
import type { Database } from '~/types/database.types';
import { APP_SETTING_KEYS, parseAppSettings } from '../../shared/utils/appSettings';
import { isTeamManagementLinkRateLimited } from '../utils/teamManagementLinkRateLimit';
import { sendTeamManagementLinkEmail } from '../utils/teamManagementLinkEmail';
import { assertOnlineTransferRequestsEnabled } from '../utils/onlineTransferRequests';

const requestSchema = z.object({
  email: z.string().trim().email(),
  turnstileToken: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  await assertOnlineTransferRequestsEnabled();
  const parsedRequest = requestSchema.safeParse(await readBody(event));

  if (!parsedRequest.success) {
    throw createError({ statusCode: 422, statusMessage: 'Please enter a valid email address' });
  }

  const email = parsedRequest.data.email.toLowerCase();
  const requesterIP = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown';

  if (!await verifyTurnstileToken(parsedRequest.data.turnstileToken, event).then(result => result.success)) {
    throw createError({ statusCode: 422, statusMessage: 'Security verification failed' });
  }

  if (isTeamManagementLinkRateLimited(requesterIP, email)) {
    setResponseHeader(event, 'Retry-After', 900);
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' });
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

  let activeSeason: string;
  try {
    activeSeason = parseAppSettings(settingsData ?? []).activeSeason;
  }
  catch {
    throw createError({ statusCode: 500, statusMessage: 'Application settings are invalid' });
  }

  const { data: teams, error: teamsError } = await supabase
    .from('drafted_teams')
    .select('team_name, team_email, key')
    .eq('active_season', activeSeason)
    .eq('allowed_transfers', true);

  if (teamsError) {
    console.error('[team-management-link] failed to find teams', teamsError.message);
    throw createError({ statusCode: 500, statusMessage: 'Could not process your request' });
  }

  const matchingTeams = (teams ?? [])
    .filter(team => team.team_email.trim().toLowerCase() === email)
    .map(team => ({ teamName: team.team_name, teamKey: team.key }));

  if (matchingTeams.length) {
    try {
      await sendTeamManagementLinkEmail(event, email, matchingTeams);
    }
    catch (error) {
      console.error('[team-management-link] email delivery failed', error);
      // Keep the response generic so delivery failures do not reveal whether
      // the address belongs to an eligible team.
    }
  }

  return {
    message: 'If an eligible team is registered to that email address, we have sent a management link.',
  };
});
