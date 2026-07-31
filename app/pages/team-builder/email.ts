import type { DraftedTeamPlayer } from '~/types/DraftedTeamPlayer';
import { PlayerPosition } from '~/types/PlayerPosition';

const config = useRuntimeConfig();
const siteUrl = config.public.SITE_URL;
const supportEmail = 'leagueofourown.fpl@gmail.com';

type CompleteDraftedTeamPlayer = DraftedTeamPlayer & {
  selectedPlayer: NonNullable<DraftedTeamPlayer['selectedPlayer']>;
};

const escapeHtml = (value: string | number): string => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll('\'', '&#039;');

const getPlayersByPosition = (players: DraftedTeamPlayer[]) => {
  const validPlayers = players.filter(
    (player): player is CompleteDraftedTeamPlayer => player.selectedPlayer !== null,
  );

  return [
    ['Goalkeeper', validPlayers.filter(player => player.position === PlayerPosition.GOALKEEPER)],
    ['Defenders', validPlayers.filter(player => player.position === PlayerPosition.DEFENDER)],
    ['Midfielders', validPlayers.filter(player => player.position === PlayerPosition.MIDFIELDER)],
    ['Forwards', validPlayers.filter(player => player.position === PlayerPosition.FORWARD)],
  ] as const;
};

const renderSquad = (players: DraftedTeamPlayer[]) => getPlayersByPosition(players)
  .map(([position, positionPlayers]) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;font-weight:700;width:120px;">${position}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;">${positionPlayers.map(player => escapeHtml(player.selectedPlayer.web_name)).join(' · ')}</td>
    </tr>
  `).join('');

const renderLayout = (title: string, content: string) => `
  <!doctype html>
  <html lang="en">
    <body style="margin:0;background:#f1f5f9;color:#0f172a;font-family:Arial,sans-serif;line-height:1.5;">
      <div style="max-width:620px;margin:0 auto;padding:24px 12px;">
        <div style="background:#172554;color:#fff;padding:22px 24px;border-radius:12px 12px 0 0;">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;">League of Our Own</div>
          <h1 style="margin:6px 0 0;font-size:24px;">${title}</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;">${content}</div>
        <p style="padding:0 8px;color:#64748b;font-size:12px;text-align:center;">Need help? <a href="mailto:${supportEmail}" style="color:#1d4ed8;">${supportEmail}</a></p>
      </div>
    </body>
  </html>
`;

const generateTeamEmail = (players: DraftedTeamPlayer[], data: {
  team_name: string;
  allowed_transfers: boolean;
  total_team_value: number;
  key: string;
}) => renderLayout(
  escapeHtml(`${data.team_name} is in`),
  `
    <p>Thanks for submitting your team. Here is a copy of your selection for your records.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">${renderSquad(players)}</table>
    <div style="background:#eff6ff;border-radius:8px;padding:14px 16px;margin:20px 0;">
      <strong>Team value:</strong> £${escapeHtml(data.total_team_value)}m<br>
      <strong>Transfers:</strong> ${data.allowed_transfers ? 'Allowed (£85m budget)' : 'Not allowed (£90m budget)'}
    </div>
    <p style="text-align:center;margin:24px 0;">
      <a href="${siteUrl}/team-builder?id=${encodeURIComponent(data.key)}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 20px;border-radius:7px;font-weight:700;">Edit your team</a>
    </p>
    <p style="font-size:13px;color:#64748b;">If you edit your team before registration closes, this link will open your saved selection.</p>
  `,
);

const generateAdminEmail = (players: DraftedTeamPlayer[], data: {
  team_name: string;
  team_owner: string;
  team_email: string;
  allowed_transfers: boolean;
  total_team_value: number;
  key: string;
}) => renderLayout(
  escapeHtml(`New team: ${data.team_name}`),
  `
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:6px 0;color:#64748b;width:120px;">Owner</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(data.team_owner)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;">${escapeHtml(data.team_email)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Transfers</td><td style="padding:6px 0;">${data.allowed_transfers ? 'Allowed (£85m)' : 'Not allowed (£90m)'}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;">Team value</td><td style="padding:6px 0;">£${escapeHtml(data.total_team_value)}m</td></tr>
    </table>
    <h2 style="font-size:17px;margin:20px 0 8px;">Selected squad</h2>
    <table style="width:100%;border-collapse:collapse;">${renderSquad(players)}</table>
    <p style="font-size:13px;color:#64748b;margin-top:22px;">Edit link: <a href="${siteUrl}/team-builder?id=${encodeURIComponent(data.key)}">open team</a></p>
  `,
);

export { generateTeamEmail, generateAdminEmail };
