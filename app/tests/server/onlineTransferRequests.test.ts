// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assertOnlineTransferRequestsEnabled } from '../../../server/utils/onlineTransferRequests';

const readSetting = vi.hoisted(() => vi.fn());

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: readSetting }),
      }),
    }),
  }),
}));

describe('online transfer availability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('SUPABASE_URL', 'http://127.0.0.1:54321');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'local-test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([null, { setting_value: 'false' }, { setting_value: 'invalid' }])(
    'blocks online requests unless explicitly enabled: %j', async (data) => {
      readSetting.mockResolvedValue({ data, error: null });

      await expect(assertOnlineTransferRequestsEnabled()).rejects.toMatchObject({
        statusCode: 404,
        statusMessage: expect.stringContaining('Please use the email template'),
      });
    },
  );

  it('allows the retained workflow only when the setting is true', async () => {
    readSetting.mockResolvedValue({ data: { setting_value: 'true' }, error: null });

    await expect(assertOnlineTransferRequestsEnabled()).resolves.toBeUndefined();
  });

  it('does not allow requests when the setting cannot be read', async () => {
    readSetting.mockResolvedValue({ data: null, error: { message: 'Unavailable' } });

    await expect(assertOnlineTransferRequestsEnabled()).rejects.toMatchObject({ statusCode: 503 });
  });

  it('does not allow requests without server configuration', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    await expect(assertOnlineTransferRequestsEnabled()).rejects.toMatchObject({ statusCode: 500 });
    expect(readSetting).not.toHaveBeenCalled();
  });
});
