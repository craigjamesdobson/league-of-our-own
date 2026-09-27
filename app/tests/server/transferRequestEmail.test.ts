// @vitest-environment node

import type { H3Event } from 'h3';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SUPPORT_EMAIL, TRANSFER_REQUEST_EMAIL } from '../../../shared/utils/contact';
import { sendTransferRequestEmails } from '../../../server/utils/transferRequestEmail';

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

describe('transfer request email delivery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handleEmailSending.mockResolvedValue({ data: { id: 'transfer-request' }, error: null });
  });

  it('sends the request to the transfers mailbox and the requester', async () => {
    await sendTransferRequestEmails({} as H3Event, {
      teamId: 1,
      teamName: 'Worldwide Wanderers',
      requesterName: 'Test Owner',
      requesterEmail: 'owner@example.com',
      firstPlayerOut: 'Player One',
      firstPlayerIn: 'Player Two',
      firstPlayerOutId: 10,
      firstPlayerInId: 20,
      secondPlayerOut: '',
      secondPlayerIn: '',
      secondPlayerOutId: null,
      secondPlayerInId: null,
      targetGameweek: 5,
    });

    expect(handleEmailSending).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'League of Our Own <notifications@leagueofourown.co.uk>',
        replyTo: 'owner@example.com',
        to: [TRANSFER_REQUEST_EMAIL],
        subject: 'Transfer request - Worldwide Wanderers',
        html: expect.stringContaining('Player One → Player Two'),
      }),
      expect.anything(),
      expect.anything(),
    );
    expect(handleEmailSending).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: SUPPORT_EMAIL,
        to: ['owner@example.com'],
        subject: 'Transfer request received - Worldwide Wanderers',
        html: expect.stringContaining('Gameweek 5'),
      }),
      expect.anything(),
      expect.anything(),
    );
  });

  it('escapes user input in the email body', async () => {
    await sendTransferRequestEmails({} as H3Event, {
      teamId: 1,
      teamName: '<Team>',
      requesterName: '<Owner>',
      requesterEmail: 'owner@example.com',
      firstPlayerOut: '<Player>',
      firstPlayerIn: 'Player & One',
      firstPlayerOutId: 10,
      firstPlayerInId: 20,
      secondPlayerOut: '',
      secondPlayerIn: '',
      secondPlayerOutId: null,
      secondPlayerInId: null,
      targetGameweek: 5,
    });

    expect(handleEmailSending).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('&lt;Team&gt;'),
      }),
      expect.anything(),
      expect.anything(),
    );
    expect(handleEmailSending.mock.calls[0]?.[0]?.html).toContain('&lt;Player&gt;');
    expect(handleEmailSending.mock.calls[0]?.[0]?.html).toContain('Player &amp; One');
  });

  it('includes the private management link in the requester email', async () => {
    await sendTransferRequestEmails({} as H3Event, {
      teamId: 1,
      teamName: 'Worldwide Wanderers',
      requesterName: 'Test Owner',
      requesterEmail: 'owner@example.com',
      firstPlayerOut: 'Player One',
      firstPlayerIn: 'Player Two',
      firstPlayerOutId: 10,
      firstPlayerInId: 20,
      secondPlayerOut: '',
      secondPlayerIn: '',
      secondPlayerOutId: null,
      secondPlayerInId: null,
      targetGameweek: 5,
      teamKey: '11111111-1111-4111-8111-111111111111',
    });

    expect(handleEmailSending).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['owner@example.com'],
        html: expect.stringContaining('https://league.example.com/manage-team?key=11111111-1111-4111-8111-111111111111'),
      }),
      expect.anything(),
      expect.anything(),
    );
  });
});
