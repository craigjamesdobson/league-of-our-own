import type { H3Event } from 'h3';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendCreatedTeamEmails } from '../../../server/utils/teamSubmissionEmail';

const handleEmailSending = vi.hoisted(() => vi.fn());
const runtimeConfig = vi.hoisted(() => ({
  deploymentEnvironment: 'production',
  app: { baseURL: '/' },
  public: { SITE_URL: 'https://league.example.com' },
}));

vi.mock('../../../server/utils/email', () => ({
  EMAIL_FROM: 'League of Our Own <notifications@leagueofourown.co.uk>',
  EMAIL_REPLY_TO: 'leagueofourown.fpl@gmail.com',
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

const team = {
  drafted_team_id: 42,
  key: '4bd08b04-a810-4faf-b368-0770360477f9',
  edited_count: 0,
  active_season: '26-27',
  team_name: 'Worldwide Wanderers',
  team_owner: 'Test Owner',
  team_email: 'owner@example.com',
  contact_number: null,
  allow_communication: false,
  allowed_transfers: false,
  total_team_value: 70,
  created_at: '2026-07-26T12:00:00.000Z',
  updated_at: null,
};

const players = [
  { player_id: 1, position: 1, cost: 5, unavailable_for_season: false, web_name: 'Keeper' },
];

describe('team submission email delivery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeConfig.deploymentEnvironment = 'production';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('reports delivery failure when Resend resolves with an error response', async () => {
    handleEmailSending
      .mockResolvedValueOnce({ data: null, error: { message: 'Quota exceeded' } })
      .mockResolvedValueOnce({ data: { id: 'admin-email' }, error: null });

    await expect(sendCreatedTeamEmails({} as H3Event, team, players)).resolves.toBe(false);
  });

  it('reports delivery success only when both emails succeed', async () => {
    handleEmailSending
      .mockResolvedValueOnce({ data: { id: 'user-email' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'admin-email' }, error: null });

    await expect(sendCreatedTeamEmails({} as H3Event, team, players)).resolves.toBe(true);
    expect(handleEmailSending).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        from: 'League of Our Own <notifications@leagueofourown.co.uk>',
        replyTo: 'leagueofourown.fpl@gmail.com',
        subject: 'Thank you for your team submission',
        html: expect.stringContaining('>Worldwide Wanderers</h1>'),
      }),
      expect.anything(),
      expect.anything(),
    );
    expect(handleEmailSending).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        from: 'League of Our Own <notifications@leagueofourown.co.uk>',
        replyTo: 'leagueofourown.fpl@gmail.com',
        subject: 'A new team has been submitted',
      }),
      expect.anything(),
      expect.anything(),
    );
  });

  it('prefixes both email subjects in staging', async () => {
    runtimeConfig.deploymentEnvironment = 'staging';
    handleEmailSending
      .mockResolvedValueOnce({ data: { id: 'user-email' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'admin-email' }, error: null });

    await sendCreatedTeamEmails({} as H3Event, team, players);

    expect(handleEmailSending).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ subject: '[STAGING] Thank you for your team submission' }),
      expect.anything(),
      expect.anything(),
    );
    expect(handleEmailSending).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ subject: '[STAGING] A new team has been submitted' }),
      expect.anything(),
      expect.anything(),
    );
  });
});
