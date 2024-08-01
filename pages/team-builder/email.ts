import type { Player } from "~/types/Player";
import { PlayerPosition } from "~/types/PlayerPosition";

const config = useRuntimeConfig();

interface DraftedTeamPlayer {
    draftedPlayerID?: number;
    position: PlayerPosition;
    selectedPlayer: Player;
}

const generateTeamEmail = (players: DraftedTeamPlayer[], data: any) => {

    const goalkeepers = players.filter(player => player.position === PlayerPosition.GOALKEEPER);
    const defenders = players.filter(player => player.position === PlayerPosition.DEFENDER);
    const midfielders = players.filter(player => player.position === PlayerPosition.MIDFIELDER);
    const forwards = players.filter(player => player.position === PlayerPosition.FORWARD);

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
}

const generateAdminEmail = (players: DraftedTeamPlayer[], data: any) => {

    const goalkeepers = players.filter(player => player.position === PlayerPosition.GOALKEEPER);
    const defenders = players.filter(player => player.position === PlayerPosition.DEFENDER);
    const midfielders = players.filter(player => player.position === PlayerPosition.MIDFIELDER);
    const forwards = players.filter(player => player.position === PlayerPosition.FORWARD);

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
            <p>Tranfers allowed - ${data.allowed_transfers}</p>
            <p>Total team value is - ${data.total_team_value}</p>
        </body>
        </html>
    `;
}

export { generateTeamEmail, generateAdminEmail }