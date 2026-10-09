import {
  transferRequestSchema,
  type TransferRequestData,
} from '../../shared/utils/transferRequest';
import { getTransferTargetGameweek } from '../../shared/utils/transferGameweek';

export class TransferRequestError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'TransferRequestError';
  }
}

export interface TransferRequestDependencies {
  isRateLimited: () => boolean;
  loadRequestSettings: () => Promise<{
    activeSeason: string;
    currentGameweek: number;
  }>;
  saveRequest: (request: TransferRequestData, targetGameweek: number, activeSeason: string, teamKey: string, pendingRequestId: number | null) => Promise<{
    transferRequestId: number;
    teamId: number;
    teamName: string;
    targetGameweek: number;
  }>;
  sendEmail: (request: TransferRequestData & { targetGameweek: number; teamKey?: string }) => Promise<boolean>;
  verifyTurnstile: (token: string) => Promise<boolean>;
}

const getPayloadValue = (payload: unknown, key: string): unknown => {
  if (!payload || typeof payload !== 'object') return undefined;
  return (payload as Record<string, unknown>)[key];
};

const TEAM_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getTeamKey = (payload: unknown): string => {
  const teamKey = getPayloadValue(payload, 'teamKey');
  if (typeof teamKey !== 'string' || !TEAM_KEY_PATTERN.test(teamKey)) {
    throw new TransferRequestError(422, 'A team management link is required');
  }

  return teamKey;
};

const getPendingRequestId = (payload: unknown): number | null => {
  const requestId = getPayloadValue(payload, 'pendingRequestId');
  if (requestId === undefined || requestId === null || requestId === '') return null;

  const parsedRequestId = typeof requestId === 'number' ? requestId : Number(requestId);
  if (!Number.isInteger(parsedRequestId) || parsedRequestId <= 0) {
    throw new TransferRequestError(422, 'Unable to submit transfer request');
  }

  return parsedRequestId;
};

export const processTransferRequest = async (
  payload: unknown,
  dependencies: TransferRequestDependencies,
) => {
  const parsedRequest = transferRequestSchema.safeParse(payload);
  if (!parsedRequest.success) {
    throw new TransferRequestError(422, 'Please complete all required transfer details');
  }

  const teamKey = getTeamKey(payload);
  const pendingRequestId = getPendingRequestId(payload);

  const honeypot = getPayloadValue(payload, 'website');
  if (typeof honeypot === 'string' && honeypot.trim()) {
    throw new TransferRequestError(422, 'Unable to submit transfer request');
  }

  const turnstileToken = getPayloadValue(payload, 'turnstileToken');
  if (typeof turnstileToken !== 'string' || !turnstileToken.trim()) {
    throw new TransferRequestError(422, 'Security verification is required');
  }

  if (!await dependencies.verifyTurnstile(turnstileToken)) {
    throw new TransferRequestError(422, 'Security verification failed');
  }

  if (dependencies.isRateLimited()) {
    throw new TransferRequestError(429, 'Too many requests. Please try again later.');
  }

  const settings = await dependencies.loadRequestSettings();
  const targetGameweek = getTransferTargetGameweek(settings.currentGameweek);
  if (!settings.activeSeason || targetGameweek === null) {
    throw new TransferRequestError(422, 'Transfer requests are not currently available');
  }

  let savedRequest;
  try {
    savedRequest = await dependencies.saveRequest(
      parsedRequest.data,
      targetGameweek,
      settings.activeSeason,
      teamKey,
      pendingRequestId,
    );
  }
  catch (error) {
    if (error instanceof TransferRequestError) throw error;
    console.error('[transfer-request] request persistence failed', error);
    const persistenceMessage = error && typeof error === 'object' && 'message' in error
      && typeof error.message === 'string'
      ? error.message
      : undefined;
    const developmentDetail = process.env.NODE_ENV === 'development' && persistenceMessage
      ? ` (${persistenceMessage})`
      : '';
    throw new TransferRequestError(
      502,
      `The transfer request could not be saved. Please try again later.${developmentDetail}`,
    );
  }

  let emailsSent = false;
  try {
    emailsSent = await dependencies.sendEmail({
      ...parsedRequest.data,
      teamId: savedRequest.teamId,
      teamName: savedRequest.teamName,
      targetGameweek: savedRequest.targetGameweek,
      teamKey,
    });
  }
  catch (error) {
    // The request is already safely stored. A failed notification must not cause
    // the user to resubmit and create a duplicate request.
    console.error('[transfer-request] email delivery failed', error);
  }

  return {
    outcome: pendingRequestId ? 'updated' as const : 'submitted' as const,
    targetGameweek: savedRequest.targetGameweek,
    emailsSent,
  };
};
