import { createClient } from '@supabase/supabase-js';
import { createError } from 'h3';
import type { Database } from '~/types/database.types';

export const assertOnlineTransferRequestsEnabled = async (): Promise<void> => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error' });
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from('settings')
    .select('setting_value')
    .eq('setting_key', 'online_transfer_requests_enabled')
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 503, statusMessage: 'Transfer settings are unavailable' });
  }

  if (data?.setting_value !== 'true') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Online transfer requests are not currently available. Please use the email template.',
    });
  }
};
