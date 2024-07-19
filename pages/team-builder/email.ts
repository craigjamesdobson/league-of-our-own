import type { Player } from "~/types/Player";
import { PlayerPosition } from "~/types/PlayerPosition";

const config = useRuntimeConfig();

interface DraftedTeamPlayer {
    draftedPlayerID?: number;
    position: PlayerPosition;
    selectedPlayer: Player;
}

const generateTeamEmail = (players: DraftedTeamPlayer[], key: string) => {

    const goalkeepers = players.filter(player => player.position === PlayerPosition.GOALKEEPER);
    const defenders = players.filter(player => player.position === PlayerPosition.DEFENDER);
    const midfielders = players.filter(player => player.position === PlayerPosition.MIDFIELDER);
    const forwards = players.filter(player => player.position === PlayerPosition.FORWARD);

    return `
        <html>
        <body>
            <h1>Your Team</h1>
            ${goalkeepers.length > 0 ? `<p>Goalkeeper: ${goalkeepers.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${defenders.length > 0 ? `<p>Defenders: ${defenders.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${midfielders.length > 0 ? `<p>Midfielders: ${midfielders.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${forwards.length > 0 ? `<p>Forwards: ${forwards.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            <p>You can edit your team by clicking  <strong><a href="href="${config.public.SITE_URL}/team-builder?id=${key}"">here</a><strong></p>
            <p><i>If you have any issues please email us at <a href="mailto:
                leagueofourown.fpl@gmail.com">leagueofourown.fpl@gmail.com</a></i></p>
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
            <h1>New Team</h1>
            <h3>Owner: ${data.team_owner}</h3>
            <h3>Name: ${data.team_name}</h3>
            <h3>email: ${data.team_email}</h3>
            ${goalkeepers.length > 0 ? `<p>Goalkeeper: ${goalkeepers.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${defenders.length > 0 ? `<p>Defenders: ${defenders.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${midfielders.length > 0 ? `<p>Midfielders: ${midfielders.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            ${forwards.length > 0 ? `<p>Forwards: ${forwards.map(player => player.selectedPlayer.web_name).join(' | ')}</p>` : ''}
            </body>
        </html>
    `;
}

export { generateTeamEmail, generateAdminEmail }