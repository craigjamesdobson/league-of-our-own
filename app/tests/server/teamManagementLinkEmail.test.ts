// @vitest-environment node

import type { H3Event } from 'h3';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendTeamManagementLinkEmail } from '../../../server/utils/teamManagementLinkEmail';

const handleEmailSending = vi.hoisted(() => vi.fn());
const runtimeConfig = vi.hoisted(() => ({
  public: { nodeEnv: 'test', SITE_URL: 'https://league.example.com' },
}));

vi.mock('../../../server/utils/email', () => ({
  EMAIL_FROM: 'League of Our Own <notifications@leagueofourown.co.uk>',
  handleEmailSending,
}));

vi.mock('resend', () => ({
  Resend: class {
    readonly emails = {};
  },
}));

mockNuxtImport('useRuntimeConfig', () => {
  return () => runtimeConfig;
});

describe('team management link email delivery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handleEmailSending.mockResolvedValue({ data: { id: 'management-link' }, error: null });
  });

  it('sends a private link for every eligible team registered to the email', async () => {
    await sendTeamManagementLinkEmail({} as H3Event, 'owner@example.com', [
      { teamName: 'Worldwide Wanderers', teamKey: '11111111-1111-4111-8111-111111111111' },
      { teamName: 'Second XI', teamKey: '22222222-2222-4222-8222-222222222222' },
    ]);

    expect(handleEmailSending).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['owner@example.com'],
        subject: 'Your team management link',
        html: expect.stringContaining('manage-team?key=11111111-1111-4111-8111-111111111111'),
      }),
      expect.anything(),
      expect.anything(),
    );
    expect(handleEmailSending.mock.calls[0]?.[0]?.html).toContain('Second XI');
  });

  it('escapes team names in the email', async () => {
    await sendTeamManagementLinkEmail({} as H3Event, 'owner@example.com', [
      { teamName: '<Team>', teamKey: '11111111-1111-4111-8111-111111111111' },
    ]);

    expect(handleEmailSending.mock.calls[0]?.[0]?.html).toContain('&lt;Team&gt;');
  });
});
