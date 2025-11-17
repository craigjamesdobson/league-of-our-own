import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { H3Event } from 'h3';
import { handleEmailSending } from '../utils/email';
import type { Database, TablesInsert } from '@/types/database.types';

interface FPLPlayer {
  id: number;
  code: number;
  cost_change_event: number;
  cost_change_start_fall: number;
  cost_change_start: number;
  element_type: number;
  first_name: string;
  news: string;
  news_added: string | null;
  now_cost: number;
  photo: string;
  second_name: string;
  status: string;
  team: number;
  team_code: number;
  web_name: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  red_cards: number;
}

type PlayerInsert = TablesInsert<'players'>;

const transformFPLPlayer = (fplPlayer: FPLPlayer): PlayerInsert => {
  const {
    id,
    code,
    cost_change_event,
    cost_change_start_fall,
    cost_change_start,
    element_type,
    first_name,
    news,
    news_added,
    now_cost,
    photo,
    second_name,
    status,
    team,
    team_code,
    web_name,
    minutes,
    goals_scored,
    assists,
    clean_sheets,
    red_cards,
  } = fplPlayer;

  return {
    player_id: id,
    code,
    cost_change_event,
    cost_change_start_fall,
    cost_change_start,
    element_type,
    first_name,
    news,
    news_added,
    now_cost,
    photo,
    second_name,
    status,
    team,
    team_code,
    web_name,
    minutes,
    goals_scored,
    assists,
    clean_sheets,
    red_cards,
  };
};

interface FPLApiResponse {
  elements: FPLPlayer[];
}

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
      from: 'League of Our Own <leagueofourown@craigjamesdobson.dev>',
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

    const fplData: FPLApiResponse = await response.json();

    if (!fplData.elements || !Array.isArray(fplData.elements)) {
      throw new Error('Invalid response format from FPL API - missing elements array');
    }
    const formattedPlayerData = fplData.elements.map(transformFPLPlayer);
    const { error } = await supabase
      .from('players')
      .upsert(formattedPlayerData)
      .select();

    if (error) {
      throw new Error(`Database upsert failed: ${error.message}`);
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
