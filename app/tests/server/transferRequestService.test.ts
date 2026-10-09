// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import {
  processTransferRequest,
  TransferRequestError,
  type TransferRequestDependencies,
} from '../../../server/utils/transferRequestService';

const validRequest = () => ({
  teamKey: '11111111-1111-4111-8111-111111111111',
  teamId: 1,
  teamName: '  Worldwide Wanderers  ',
  requesterName: '  Test Owner  ',
  requesterEmail: ' OWNER@EXAMPLE.COM ',
  firstPlayerOut: '  Player One ',
  firstPlayerIn: ' Player Two ',
  firstPlayerOutId: 10,
  firstPlayerInId: 20,
  secondPlayerOut: 'Player Three',
  secondPlayerIn: 'Player Four',
  secondPlayerOutId: 30,
  secondPlayerInId: 40,
  turnstileToken: 'valid-token',
  website: '',
});

const createDependencies = (
  overrides: Partial<TransferRequestDependencies> = {},
): TransferRequestDependencies => ({
  isRateLimited: vi.fn().mockReturnValue(false),
  loadRequestSettings: vi.fn().mockResolvedValue({
    activeSeason: '26-27',
    currentGameweek: 4,
  }),
  saveRequest: vi.fn().mockResolvedValue({
    transferRequestId: 1,
    teamId: 1,
    teamName: 'Worldwide Wanderers',
    targetGameweek: 5,
  }),
  sendEmail: vi.fn().mockResolvedValue(true),
  verifyTurnstile: vi.fn().mockResolvedValue(true),
  ...overrides,
});

describe('processTransferRequest', () => {
  it('normalises and sends a valid request', async () => {
    const dependencies = createDependencies();

    await expect(processTransferRequest(validRequest(), dependencies)).resolves.toEqual({
      outcome: 'submitted',
      targetGameweek: 5,
      emailsSent: true,
    });
    expect(dependencies.verifyTurnstile).toHaveBeenCalledWith('valid-token');
    expect(dependencies.saveRequest).toHaveBeenCalledWith(expect.objectContaining({
      teamName: 'Worldwide Wanderers',
    }), 5, '26-27', '11111111-1111-4111-8111-111111111111', null);
    expect(dependencies.sendEmail).toHaveBeenCalledWith({
      teamName: 'Worldwide Wanderers',
      requesterName: 'Test Owner',
      requesterEmail: 'OWNER@EXAMPLE.COM',
      firstPlayerOut: 'Player One',
      firstPlayerIn: 'Player Two',
      secondPlayerOut: 'Player Three',
      secondPlayerIn: 'Player Four',
      teamId: 1,
      firstPlayerOutId: 10,
      firstPlayerInId: 20,
      secondPlayerOutId: 30,
      secondPlayerInId: 40,
      targetGameweek: 5,
      teamKey: '11111111-1111-4111-8111-111111111111',
    });
  });

  it('rejects a request without a valid security check', async () => {
    const dependencies = createDependencies({
      verifyTurnstile: vi.fn().mockResolvedValue(false),
    });

    await expect(processTransferRequest(validRequest(), dependencies)).rejects.toMatchObject({
      statusCode: 422,
      message: 'Security verification failed',
    });
    expect(dependencies.saveRequest).not.toHaveBeenCalled();
    expect(dependencies.sendEmail).not.toHaveBeenCalled();
  });

  it('rejects honeypot submissions before sending email', async () => {
    const dependencies = createDependencies();

    await expect(processTransferRequest({ ...validRequest(), website: 'spam' }, dependencies)).rejects.toMatchObject({
      statusCode: 422,
      message: 'Unable to submit transfer request',
    });
    expect(dependencies.verifyTurnstile).not.toHaveBeenCalled();
    expect(dependencies.saveRequest).not.toHaveBeenCalled();
    expect(dependencies.sendEmail).not.toHaveBeenCalled();
  });

  it('rejects requests once the rate limit is reached', async () => {
    const dependencies = createDependencies({
      isRateLimited: vi.fn().mockReturnValue(true),
    });

    await expect(processTransferRequest(validRequest(), dependencies)).rejects.toMatchObject({
      statusCode: 429,
      message: 'Too many requests. Please try again later.',
    });
    expect(dependencies.saveRequest).not.toHaveBeenCalled();
    expect(dependencies.sendEmail).not.toHaveBeenCalled();
  });

  it('keeps the saved request when email delivery fails', async () => {
    const dependencies = createDependencies({
      sendEmail: vi.fn().mockRejectedValue(new Error('Resend quota exceeded')),
    });

    await expect(processTransferRequest(validRequest(), dependencies)).resolves.toEqual({
      outcome: 'submitted',
      targetGameweek: 5,
      emailsSent: false,
    });
    expect(dependencies.saveRequest).toHaveBeenCalledOnce();
  });

  it('preserves a stale-request conflict for the endpoint to report', async () => {
    const dependencies = createDependencies({
      saveRequest: vi.fn().mockRejectedValue(
        new TransferRequestError(409, 'This transfer request has changed. Refresh the page and try again.'),
      ),
    });

    await expect(processTransferRequest(validRequest(), dependencies)).rejects.toMatchObject({
      statusCode: 409,
      message: 'This transfer request has changed. Refresh the page and try again.',
    });
    expect(dependencies.sendEmail).not.toHaveBeenCalled();
  });

  it('targets the final gameweek when the active gameweek is 37', async () => {
    const dependencies = createDependencies({
      loadRequestSettings: vi.fn().mockResolvedValue({
        activeSeason: '26-27',
        currentGameweek: 37,
      }),
      saveRequest: vi.fn().mockResolvedValue({
        transferRequestId: 2,
        teamId: 1,
        teamName: 'Worldwide Wanderers',
        targetGameweek: 38,
      }),
    });

    await expect(processTransferRequest(validRequest(), dependencies)).resolves.toMatchObject({
      outcome: 'submitted',
      targetGameweek: 38,
    });
    expect(dependencies.saveRequest).toHaveBeenCalledWith(
      expect.anything(),
      38,
      '26-27',
      expect.any(String),
      null,
    );
  });

  it('closes transfer requests once the final gameweek is active', async () => {
    const dependencies = createDependencies({
      loadRequestSettings: vi.fn().mockResolvedValue({
        activeSeason: '26-27',
        currentGameweek: 38,
      }),
    });

    await expect(processTransferRequest(validRequest(), dependencies)).rejects.toMatchObject({
      statusCode: 422,
      message: 'Transfer requests are not currently available',
    });
    expect(dependencies.saveRequest).not.toHaveBeenCalled();
    expect(dependencies.sendEmail).not.toHaveBeenCalled();
  });
});
