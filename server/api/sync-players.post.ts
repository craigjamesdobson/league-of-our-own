import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { H3Event } from 'h3';
import {
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  handleEmailSending,
} from '../utils/email';
import { prepareFplPlayersForSync } from '../utils/fplPlayers';
import type { Database } from '~/types/database.types';

const sendSyncFailureEmail = async (errorMessage: string, event: H3Event) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!adminEmail || !resendApiKey) {
      console.error('Missing email configuration for failure notification');
      return;
    }

    const resend = new Resend(resendApiKey);
    const currentTime = new Date().toISOString();

    await handleEmailSending({
      from: EMAIL_FROM,
      replyTo: EMAIL_REPLY_TO,
      to: [adminEmail],
      subject: 'Player Sync Failed',
      html: `
        <h2>Player Data Sync Failed</h2>
        <p><strong>Time:</strong> ${currentTime}</p>
        <p><strong>Error:</strong> ${errorMessage}</p>
        <p>You may need to manually trigger the sync or investigate the issue.</p>
        <p>You can manually sync by calling the API endpoint with the correct API key.</p>
      `,
    }, resend, event);

    console.log('Failure notification email sent to:', adminEmail);
  }
  catch (emailError) {
    console.error('Failed to send failure notification email:', emailError);
  }
};

export default defineEventHandler(async (event) => {
  try {
    const apiKey = getHeader(event, 'x-api-key');
    const expectedKey = process.env.SYNC_API_KEY;

    if (!expectedKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error',
      });
    }

    if (!apiKey || apiKey !== expectedKey) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static');

    if (!response.ok) {
      throw new Error(`FPL API responded with status: ${response.status}`);
    }

    const fplData = await response.json();

    if (!fplData.elements || !Array.isArray(fplData.elements)) {
      throw new Error('Invalid response format from FPL API - missing elements array');
    }
    const formattedPlayerData = prepareFplPlayersForSync(fplData);
    const { error } = await supabase
      .from('players')
      .upsert(formattedPlayerData)
      .select();

    if (error) {
      throw new Error(`Database upsert failed: ${error.message}`);
    }

    const syncTimestamp = new Date().toISOString();
    const { error: syncStatusError } = await supabase
      .from('settings')
      .upsert({
        setting_key: 'player_data_last_synced_at',
        setting_value: syncTimestamp,
        updated_at: syncTimestamp,
      }, { onConflict: 'setting_key' });

    if (syncStatusError) {
      throw new Error(`Sync status update failed: ${syncStatusError.message}`);
    }

    return {
      success: true,
      message: `Successfully synced ${formattedPlayerData.length} players`,
      playersCount: formattedPlayerData.length,
    };
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await sendSyncFailureEmail(errorMessage, event);

    throw createError({
      statusCode: 500,
      statusMessage: `Player sync failed: ${errorMessage}`,
    });
  }
});
