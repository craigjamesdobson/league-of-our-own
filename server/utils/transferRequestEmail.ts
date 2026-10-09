import { Resend } from 'resend';
import type { H3Event } from 'h3';
import { TRANSFER_REQUEST_EMAIL, SUPPORT_EMAIL } from '../../shared/utils/contact';
import { getRequestedTransfers, type TransferRequestData } from '../../shared/utils/transferRequest';
import {
  EMAIL_FROM,
  handleEmailSending,
} from './email';
import { getTeamManagementUrl } from './teamManagementLink';

export type TransferRequestEmailData = TransferRequestData & {
  targetGameweek: number;
  teamKey?: string;
};

const isStaging = (): boolean =>
  process.env.DEPLOYMENT_ENV?.trim().toLowerCase() === 'staging';

const emailSubject = (subject: string): string =>
  isStaging() ? `[STAGING] ${subject}` : subject;

const escapeHtml = (value: string | number): string => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll('\'', '&#039;');

const renderLayout = (title: string, content: string) => `
  <!doctype html>
  <html lang="en">
    <body style="margin:0;background:#f1f5f9;color:#0f172a;font-family:Arial,sans-serif;line-height:1.5;">
      <div style="max-width:620px;margin:0 auto;padding:24px 12px;">
        <div style="background:#172554;color:#fff;padding:22px 24px;border-radius:12px 12px 0 0;">
          ${isStaging() ? '<div style="display:inline-block;background:#fbbf24;color:#422006;padding:4px 9px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.12em;line-height:1;text-transform:uppercase;margin-bottom:10px;">Staging</div>' : ''}
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;">League of Our Own</div>
          <h1 style="margin:6px 0 0;font-size:24px;">${title}</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;">${content}</div>
        <p style="padding:0 8px;color:#64748b;font-size:12px;text-align:center;">Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:#1d4ed8;">${SUPPORT_EMAIL}</a></p>
      </div>
    </body>
  </html>
`;

const renderTransferRows = (request: TransferRequestEmailData) => getRequestedTransfers(request)
  .map((transfer, index) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;font-weight:700;width:120px;">Transfer ${index + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;">${escapeHtml(transfer.playerOut)} → ${escapeHtml(transfer.playerIn)}</td>
    </tr>
  `)
  .join('');

const renderRequestDetails = (request: TransferRequestEmailData) => `
  <table style="width:100%;border-collapse:collapse;margin:20px 0;">
    <tr><td style="padding:6px 0;color:#64748b;width:120px;">Team</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(request.teamName)}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Requester</td><td style="padding:6px 0;">${escapeHtml(request.requesterName)}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;">${escapeHtml(request.requesterEmail)}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Applies to</td><td style="padding:6px 0;font-weight:700;">Gameweek ${escapeHtml(request.targetGameweek)}</td></tr>
  </table>
  <h2 style="font-size:17px;margin:20px 0 8px;">Requested transfers</h2>
  <table style="width:100%;border-collapse:collapse;">${renderTransferRows(request)}</table>
`;

const renderAdminEmail = (request: TransferRequestEmailData) => renderLayout(
  escapeHtml(`Transfer request: ${request.teamName}`),
  `
    <p>A new transfer request has been submitted for manual review.</p>
    ${renderRequestDetails(request)}
    <p style="font-size:13px;color:#64748b;margin-top:22px;">The request has not changed the team. Confirming it in the admin area will apply the requested transfers to the live team.</p>
  `,
);

const renderRequesterEmail = (event: H3Event, request: TransferRequestEmailData) => renderLayout(
  'Transfer request received',
  `
    <p>Hi ${escapeHtml(request.requesterName)},</p>
    <p>We have received your transfer request for <strong>${escapeHtml(request.teamName)}</strong>.</p>
    ${renderRequestDetails(request)}
    <div style="background:#eff6ff;border-radius:8px;padding:14px 16px;margin:20px 0;">
      Nothing has changed on your team yet. We will review the request and contact you if there is a problem. If approved, the changes will apply to Gameweek ${escapeHtml(request.targetGameweek)}.
    </div>
    ${request.teamKey ? `<p style="text-align:center;margin:24px 0;"><a href="${escapeHtml(getTeamManagementUrl(event, request.teamKey))}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 20px;border-radius:7px;font-weight:700;">Manage your team</a></p><p style="font-size:13px;color:#64748b;">Use this private link to view or change your pending transfer request before the Gameweek ${escapeHtml(request.targetGameweek)} deadline.</p>` : ''}
  `,
);

const sendEmail = async (event: H3Event, options: {
  to: string;
  replyTo: string;
  subject: string;
  html: string;
}) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const response = await handleEmailSending({
    from: EMAIL_FROM,
    replyTo: options.replyTo,
    to: [options.to],
    subject: options.subject,
    html: options.html,
  }, resend, event);

  if (response.error) throw new Error(response.error.message);
};

export const sendTransferRequestEmails = async (
  event: H3Event,
  request: TransferRequestEmailData,
): Promise<boolean> => {
  const deliveries = await Promise.allSettled([
    sendEmail(event, {
      to: TRANSFER_REQUEST_EMAIL,
      replyTo: request.requesterEmail,
      subject: emailSubject(`Transfer request - ${request.teamName}`),
      html: renderAdminEmail(request),
    }),
    sendEmail(event, {
      to: request.requesterEmail,
      replyTo: SUPPORT_EMAIL,
      subject: emailSubject(`Transfer request received - ${request.teamName}`),
      html: renderRequesterEmail(event, request),
    }),
  ]);

  deliveries.forEach((delivery, index) => {
    if (delivery.status === 'rejected') {
      console.error(`[transfer-request] ${index === 0 ? 'admin' : 'requester'} email failed`, delivery.reason);
    }
  });

  return deliveries.every(delivery => delivery.status === 'fulfilled');
};
