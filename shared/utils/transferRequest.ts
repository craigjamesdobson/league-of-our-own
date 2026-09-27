import { z } from 'zod';

const transferRequestFieldsSchema = z.object({
  teamId: z.number().int().positive('Select your team'),
  teamName: z.string().trim().min(1, 'Select your team'),
  requesterName: z.string().trim().min(1, 'The name field is required'),
  requesterEmail: z.string().trim().min(1, 'The email field is required').email('Invalid email format'),
  firstPlayerOut: z.string().trim().min(1, 'Enter the player you want to transfer out'),
  firstPlayerIn: z.string().trim().min(1, 'Enter the player you want to transfer in'),
  firstPlayerOutId: z.number().int().positive('Select the player you want to transfer out'),
  firstPlayerInId: z.number().int().positive('Select the player you want to transfer in'),
  secondPlayerOut: z.string().trim(),
  secondPlayerIn: z.string().trim(),
  secondPlayerOutId: z.number().int().positive().nullable(),
  secondPlayerInId: z.number().int().positive().nullable(),
});

export const transferRequestSchema = transferRequestFieldsSchema.superRefine((data, context) => {
  const hasSecondPlayerOut = data.secondPlayerOut.length > 0;
  const hasSecondPlayerIn = data.secondPlayerIn.length > 0;

  if (hasSecondPlayerOut !== hasSecondPlayerIn) {
    const field = hasSecondPlayerOut ? 'secondPlayerIn' : 'secondPlayerOut';
    context.addIssue({
      code: 'custom',
      message: 'Complete both fields or leave this transfer slot blank',
      path: [field],
    });
  }

  const hasSecondPlayerOutId = data.secondPlayerOutId !== null;
  const hasSecondPlayerInId = data.secondPlayerInId !== null;

  if (hasSecondPlayerOutId !== hasSecondPlayerInId
    || hasSecondPlayerOut !== hasSecondPlayerOutId
    || hasSecondPlayerIn !== hasSecondPlayerInId) {
    const field = hasSecondPlayerOutId ? 'secondPlayerInId' : 'secondPlayerOutId';
    context.addIssue({
      code: 'custom',
      message: 'Complete both fields or leave this transfer slot blank',
      path: [field],
    });
  }
});

export type TransferRequestData = z.output<typeof transferRequestSchema>;

export const getRequestedTransfers = (data: TransferRequestData) => [
  {
    playerOut: data.firstPlayerOut,
    playerIn: data.firstPlayerIn,
  },
  ...(data.secondPlayerOut && data.secondPlayerIn
    ? [{
        playerOut: data.secondPlayerOut,
        playerIn: data.secondPlayerIn,
      }]
    : []),
];
