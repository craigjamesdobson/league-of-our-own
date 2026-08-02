import { Resend } from 'resend';
import type { H3Event } from 'h3';
import type { SubmissionPlayer } from './teamSubmission';
import type { SavedTeam } from './teamSubmissionService';
import {
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  handleEmailSending,
} from './email';

const supportEmail = EMAIL_REPLY_TO;

const isStaging = (): boolean =>
  process.env.DEPLOYMENT_ENV?.trim().toLowerCase() === 'staging';

const emailSubject = (subject: string): string =>
  isStaging()
    ? `[STAGING] ${subject}`
    : subject;

const escapeHtml = (value: string | number): string => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll('\'', '&#039;');

const getEditUrl = (event: H3Event, key: string): string => {
  const config = useRuntimeConfig(event);
  const configuredSiteUrl = String(config.public.SITE_URL ?? '').trim();

  if (!configuredSiteUrl) {
    throw new Error('SITE_URL is required to send team edit links');
  }

  const editUrl = new URL('/team-builder', configuredSiteUrl);
  editUrl.searchParams.set('id', key);
  return editUrl.toString();
};

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
        <p style="padding:0 8px;color:#64748b;font-size:12px;text-align:center;">Need help? <a href="mailto:${supportEmail}" style="color:#1d4ed8;">${supportEmail}</a></p>
      </div>
    </body>
  </html>
`;

const renderSquad = (players: SubmissionPlayer[]) => {
  const positions = [
    ['Goalkeeper', 1],
    ['Defenders', 2],
    ['Midfielders', 3],
    ['Forwards', 4],
  ] as const;

  return positions.map(([label, position]) => {
    const names = players
      .filter(player => player.position === position)
      .map(player => escapeHtml(player.web_name ?? 'Unknown player'))
      .join(' · ');

    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;font-weight:700;width:120px;">${label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;">${names}</td>
      </tr>
    `;
  }).join('');
};

const renderTeamConfirmation = (event: H3Event, team: SavedTeam, players: SubmissionPlayer[]) => renderLayout(
  escapeHtml(team.team_name),
  `
    <p>Thanks for submitting your team. Here is a copy of your selection for your records.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">${renderSquad(players)}</table>
    <div style="background:#eff6ff;border-radius:8px;padding:14px 16px;margin:20px 0;">
      <strong>Team value:</strong> £${escapeHtml(team.total_team_value)}m<br>
      <strong>Transfers:</strong> ${team.allowed_transfers ? 'Allowed (£85m budget)' : 'Not allowed (£90m budget)'}
    </div>
    <p style="text-align:center;margin:24px 0;">
      <a href="${escapeHtml(getEditUrl(event, team.key))}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 20px;border-radius:7px;font-weight:700;">Edit your team</a>
    </p>
    <p style="font-size:13px;color:#64748b;">If you edit your team before registration closes, this link will open your saved selection.</p>
  `,
);

const renderAdminNotification = (event: H3Event, team: SavedTeam, players: SubmissionPlayer[]) => renderLayout(
  escapeHtml(`New team: ${team.team_name}`),
  `
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:6px 0;color:#64748b;width:120px;">Owner</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(team.team_owner)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;">${escapeHtml(team.team_email)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Transfers</td><td style="padding:6px 0;">${team.allowed_transfers ? 'Allowed (£85m)' : 'Not allowed (£90m)'}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Team value</td><td style="padding:6px 0;">£${escapeHtml(team.total_team_value)}m</td></tr>
    </table>
    <h2 style="font-size:17px;margin:20px 0 8px;">Selected squad</h2>
    <table style="width:100%;border-collapse:collapse;">${renderSquad(players)}</table>
    <p style="font-size:13px;color:#64748b;margin-top:22px;">Edit link: <a href="${escapeHtml(getEditUrl(event, team.key))}">open team</a></p>
  `,
);

const sendEmail = async (event: H3Event, options: {
  to: string;
  subject: string;
  html: string;
}) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const response = await handleEmailSending({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to: [options.to],
    subject: options.subject,
    html: options.html,
  }, resend, event);

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const sendCreatedTeamEmails = async (
  event: H3Event,
  team: SavedTeam,
  players: SubmissionPlayer[],
): Promise<boolean> => {
  const deliveries = await Promise.allSettled([
    sendEmail(event, {
      to: team.team_email,
      subject: emailSubject('Thank you for your team submission'),
      html: renderTeamConfirmation(event, team, players),
    }),
    sendEmail(event, {
      to: supportEmail,
      subject: emailSubject('A new team has been submitted'),
      html: renderAdminNotification(event, team, players),
    }),
  ]);

  deliveries.forEach((delivery, index) => {
    if (delivery.status === 'rejected') {
      console.error(`[team-submission] ${index === 0 ? 'confirmation' : 'admin notification'} email failed`, delivery.reason);
    }
  });

  return deliveries.every(delivery => delivery.status === 'fulfilled');
};
