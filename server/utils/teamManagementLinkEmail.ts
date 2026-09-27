import { Resend } from 'resend';
import type { H3Event } from 'h3';
import { SUPPORT_EMAIL } from '../../shared/utils/contact';
import { EMAIL_FROM, handleEmailSending } from './email';
import { getTeamManagementUrl } from './teamManagementLink';

type ManagementTeamLink = {
  teamName: string;
  teamKey: string;
};

const isStaging = (): boolean =>
  process.env.DEPLOYMENT_ENV?.trim().toLowerCase() === 'staging';

const escapeHtml = (value: string): string => String(value)
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

const renderTeamLinks = (event: H3Event, teams: ManagementTeamLink[]) => teams
  .map(team => `
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:12px 0;">
      <strong style="display:block;margin-bottom:12px;">${escapeHtml(team.teamName)}</strong>
      <a href="${escapeHtml(getTeamManagementUrl(event, team.teamKey))}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:10px 16px;border-radius:7px;font-weight:700;">Manage your team</a>
    </div>
  `)
  .join('');

const renderEmail = (event: H3Event, teams: ManagementTeamLink[]) => renderLayout(
  'Your team management link',
  `
    <p>Use the link below to view your team and submit transfer requests.</p>
    ${renderTeamLinks(event, teams)}
    <p style="font-size:13px;color:#64748b;margin-top:22px;">This link is private. Anyone with access to it can manage transfer requests for the team, so please do not forward it.</p>
  `,
);

export const sendTeamManagementLinkEmail = async (
  event: H3Event,
  recipient: string,
  teams: ManagementTeamLink[],
): Promise<void> => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const response = await handleEmailSending({
    from: EMAIL_FROM,
    replyTo: SUPPORT_EMAIL,
    to: [recipient],
    subject: `${isStaging() ? '[STAGING] ' : ''}Your team management link`,
    html: renderEmail(event, teams),
  }, resend, event);

  if (response.error) throw new Error(response.error.message);
};

export type { ManagementTeamLink };
