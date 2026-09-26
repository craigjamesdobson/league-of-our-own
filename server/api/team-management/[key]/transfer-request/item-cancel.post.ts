import { createClient } from '@supabase/supabase-js';
import { readBody } from 'h3';
import type { Database } from '~/types/database.types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CancelTransferRequestItemRpcClient = {
  rpc: (
    functionName: 'cancel_transfer_request_item',
    args: {
      p_transfer_request_id: number;
      p_transfer_number: number;
      p_team_key: string;
    },
  ) => Promise<{
    data: { transfer_request_id: number } | null;
    error: { message: string } | null;
  }>;
};

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key');

  if (!key || !UUID_PATTERN.test(key)) {
    throw createError({ statusCode: 404, statusMessage: 'No team found' });
  }

  const body = await readBody<{
    transferRequestId?: unknown;
    transferNumber?: unknown;
  }>(event);
  const transferRequestId = typeof body?.transferRequestId === 'number'
    ? body.transferRequestId
    : Number(body?.transferRequestId);
  const transferNumber = typeof body?.transferNumber === 'number'
    ? body.transferNumber
    : Number(body?.transferNumber);

  if (!Number.isInteger(transferRequestId)
    || transferRequestId <= 0
    || !Number.isInteger(transferNumber)
    || ![1, 2].includes(transferNumber)) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid transfer request' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error' });
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  const rpcClient = supabase as unknown as CancelTransferRequestItemRpcClient;
  const { data, error } = await rpcClient.rpc('cancel_transfer_request_item', {
    p_transfer_request_id: transferRequestId,
    p_transfer_number: transferNumber,
    p_team_key: key,
  });

  if (error || !data) {
    const message = error?.message ?? 'The transfer could not be cancelled';
    const baseStatusMessage = message.includes('Transfer request deadline has passed')
      ? 'The transfer request can no longer be changed because the deadline has passed.'
      : message.includes('Transfer request item not found')
        ? 'This transfer is no longer pending. Refresh the page and try again.'
        : 'The transfer could not be cancelled. It may already have been reviewed.';
    const developmentDetail = process.env.NODE_ENV === 'production' ? '' : ` (${message})`;

    throw createError({ statusCode: 422, statusMessage: `${baseStatusMessage}${developmentDetail}` });
  }

  return {
    cancelled: true,
    transferRequestId: data.transfer_request_id,
    transferNumber,
  };
});
