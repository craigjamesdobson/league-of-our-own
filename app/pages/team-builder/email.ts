import type { DraftedTeamPlayer } from '~/types/DraftedTeamPlayer';
import { PlayerPosition } from '~/types/PlayerPosition';

const config = useRuntimeConfig();

// Helper type for players that definitely have a selected player
type CompleteDraftedTeamPlayer = DraftedTeamPlayer & {
  selectedPlayer: NonNullable<DraftedTeamPlayer['selectedPlayer']>;
};

const generateTeamEmail = (players: DraftedTeamPlayer[], data: {
  team_name: string;
  allowed_transfers: boolean;
  total_team_value: number;
  key: string;
}) => {
  // Filter out any null players and group by position
  const validPlayers = players.filter(
    (player): player is CompleteDraftedTeamPlayer => player.selectedPlayer !== null,
  );
  const goalkeepers = validPlayers.filter(player => player.position === PlayerPosition.GOALKEEPER);
  const defenders = validPlayers.filter(player => player.position === PlayerPosition.DEFENDER);
  const midfielders = validPlayers.filter(player => player.position === PlayerPosition.MIDFIELDER);
  const forwards = validPlayers.filter(player => player.position === PlayerPosition.FORWARD);

  return `
        <html>
        <body>
            <h1>Your Team - ${data.team_name}</h1>
            ${goalkeepers.length > 0 ? `<p>Goalkeeper: ${goalkeepers.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${defenders.length > 0 ? `<p>Defenders: ${defenders.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${midfielders.length > 0 ? `<p>Midfielders: ${midfielders.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${forwards.length > 0 ? `<p>Forwards: ${forwards.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            <p>You have chosen to <strong>${data.allowed_transfers ? 'use transfers' : 'not use transfers'}</strong> and your total team value is <strong>${data.total_team_value}</strong></p>
            <p>You can edit your team by clicking <strong><a href="${config.public.SITE_URL}/team-builder?id=${data.key}">here</a></strong></p>
            <p><i>If you have any issues please email us at <a href="mailto:leagueofourown.fpl@gmail.com">leagueofourown.fpl@gmail.com</a></i></p>
        </body>
        </html>
    `;
};

const generateAdminEmail = (players: DraftedTeamPlayer[], data: {
  team_name: string;
  team_owner: string;
  team_email: string;
  allowed_transfers: boolean;
  total_team_value: number;
  key: string;
}) => {
  // Filter out any null players and group by position
  const validPlayers = players.filter(
    (player): player is CompleteDraftedTeamPlayer => player.selectedPlayer !== null,
  );
  const goalkeepers = validPlayers.filter(player => player.position === PlayerPosition.GOALKEEPER);
  const defenders = validPlayers.filter(player => player.position === PlayerPosition.DEFENDER);
  const midfielders = validPlayers.filter(player => player.position === PlayerPosition.MIDFIELDER);
  const forwards = validPlayers.filter(player => player.position === PlayerPosition.FORWARD);

  return `
        <html>
        <body>
            <h1>New Team - ${data.team_name}</h1>
            <h3>Owner: ${data.team_owner}</h3>
            <h3>Name: ${data.team_name}</h3>
            <h3>email: ${data.team_email}</h3>
            ${goalkeepers.length > 0 ? `<p>Goalkeeper: ${goalkeepers.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${defenders.length > 0 ? `<p>Defenders: ${defenders.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${midfielders.length > 0 ? `<p>Midfielders: ${midfielders.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${forwards.length > 0 ? `<p>Forwards: ${forwards.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            <p>Transfers allowed - ${data.allowed_transfers}</p>
            <p>Total team value is - ${data.total_team_value}</p>
        </body>
        </html>
    `;
};

export { generateTeamEmail, generateAdminEmail };
