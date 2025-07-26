import type { SquadTableProps } from '../types';
import type { DraftedTeamPlayer } from '~/types/DraftedTeamPlayer';
import { PlayerPosition } from '~/types/PlayerPosition';

/**
 * Position icons as SVG constants
 */
const POSITION_ICONS = {
  [PlayerPosition.GOALKEEPER]: `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 6px;"><path fill="#0b0c3d" d="M9.599 3.495C9.908 2.655 10.646 2 11.616 2s1.709.654 2.018 1.495a2 2 0 0 1 .834-.177c1.293 0 2.176 1.164 2.176 2.382v.437a2 2 0 0 1 .676-.114c1.293 0 2.176 1.165 2.176 2.382v5.705c.018.709.021 2.63-.828 4.4c-.433.904-1.095 1.784-2.098 2.436c-1.005.654-2.304 1.047-3.96 1.054h-.003c-1.814 0-3.424-.886-4.6-1.784a14 14 0 0 1-2.3-2.241a4 4 0 0 0-.16-.19L3.202 15.23l-.012-.013c-.804-.92-.804-2.375 0-3.295c.85-.973 2.273-.979 3.13-.018l.27.275v-6.48c0-1.217.882-2.381 2.175-2.381c.303 0 .583.064.835.177m-.16 2.198c-.003-.58-.395-.875-.676-.875s-.676.297-.676.882v8.315a.75.75 0 0 1-1.285.525l-1.568-1.6l-.03-.03c-.258-.296-.629-.296-.887 0c-.308.352-.31.958-.005 1.314l2.34 2.547q.125.138.225.266a12.4 12.4 0 0 0 2.04 1.986c1.064.813 2.352 1.477 3.688 1.477c1.413-.006 2.42-.339 3.146-.811c.729-.474 1.225-1.12 1.563-1.827c.69-1.439.698-3.062.68-3.723V8.405c0-.585-.394-.882-.675-.882s-.676.297-.676.882v2.825a.75.75 0 1 1-1.5 0V5.7c0-.585-.395-.882-.676-.882s-.676.297-.676.882v5.53a.75.75 0 1 1-1.5 0V4.382c0-.585-.394-.882-.676-.882c-.281 0-.676.297-.676.882v6.66a.75.75 0 0 1-1.5 0z"/></svg>`,
  [PlayerPosition.DEFENDER]: `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 512 512" style="vertical-align: middle; margin-right: 6px;"><path fill="#0b0c3d" d="m466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3c11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3M256.1 446.3l-.1-381l175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7"/></svg>`,
  [PlayerPosition.MIDFIELDER]: `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 6px;"><g fill="none" stroke="#0b0c3d" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M15.5 13a3.5 3.5 0 0 0-3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1-7 0v-1.8"/><path d="M17.5 16a3.5 3.5 0 0 0 0-7H17"/><path d="M19 9.3V6.5a3.5 3.5 0 0 0-7 0M6.5 16a3.5 3.5 0 0 1 0-7H7"/><path d="M5 9.3V6.5a3.5 3.5 0 0 1 7 0v10"/></g></svg>`,
  [PlayerPosition.FORWARD]: `<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 6px;"><path fill="#0b0c3d" d="M20.172 6.75h-1.861l-4.566 4.564a1.874 1.874 0 1 1-1.06-1.06l4.565-4.565V3.828a.94.94 0 0 1 .275-.664l1.73-1.73a.25.25 0 0 1 .25-.063c.089.026.155.1.173.191l.46 2.301l2.3.46c.09.018.164.084.19.173a.25.25 0 0 1-.062.249l-1.731 1.73a.94.94 0 0 1-.663.275"/><path fill="#0b0c3d" d="M2.625 12A9.375 9.375 0 0 0 12 21.375A9.375 9.375 0 0 0 21.375 12c0-.898-.126-1.766-.361-2.587A.75.75 0 0 1 22.455 9c.274.954.42 1.96.42 3c0 6.006-4.869 10.875-10.875 10.875S1.125 18.006 1.125 12S5.994 1.125 12 1.125c1.015-.001 2.024.14 3 .419a.75.75 0 1 1-.413 1.442A9.4 9.4 0 0 0 12 2.625A9.375 9.375 0 0 0 2.625 12"/><path fill="#0b0c3d" d="M7.125 12a4.874 4.874 0 1 0 9.717-.569a.748.748 0 0 1 1.047-.798c.251.112.42.351.442.625a6.373 6.373 0 0 1-10.836 5.253a6.376 6.376 0 0 1 5.236-10.844a.75.75 0 1 1-.17 1.49A4.876 4.876 0 0 0 7.125 12"/></svg>`,
} as const;

/**
 * Position labels for display
 */
const POSITION_LABELS = {
  [PlayerPosition.GOALKEEPER]: 'Goalkeeper',
  [PlayerPosition.DEFENDER]: 'Defenders',
  [PlayerPosition.MIDFIELDER]: 'Midfielders',
  [PlayerPosition.FORWARD]: 'Forwards',
} as const;

/**
 * Helper type for players that definitely have a selected player
 */
type CompleteDraftedTeamPlayer = DraftedTeamPlayer & {
  selectedPlayer: NonNullable<DraftedTeamPlayer['selectedPlayer']>;
};

/**
 * Groups players by position and filters out empty slots
 */
const groupPlayersByPosition = (players: DraftedTeamPlayer[]) => {
  const validPlayers = players.filter(
    (player): player is CompleteDraftedTeamPlayer => player.selectedPlayer !== null,
  );

  return {
    goalkeepers: validPlayers.filter(player => player.position === PlayerPosition.GOALKEEPER),
    defenders: validPlayers.filter(player => player.position === PlayerPosition.DEFENDER),
    midfielders: validPlayers.filter(player => player.position === PlayerPosition.MIDFIELDER),
    forwards: validPlayers.filter(player => player.position === PlayerPosition.FORWARD),
  };
};

/**
 * Generates a table row for a specific position
 */
const generatePositionRow = (
  position: PlayerPosition,
  players: CompleteDraftedTeamPlayer[],
  showIcons: boolean,
): string => {
  if (players.length === 0) return '';

  const icon = showIcons ? POSITION_ICONS[position] : '';
  const label = POSITION_LABELS[position];
  const playerNames = players.map(player => player.selectedPlayer.web_name).join(', ');

  return `
    <tr>
        <td style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 12px; font-weight: bold; color: #0b0c3d;">
            ${icon}${label}
        </td>
        <td style="border: 1px solid #dee2e6; padding: 12px;">${playerNames}</td>
    </tr>`;
};

/**
 * Generates the complete squad table HTML
 */
export const generateSquadTable = (props: SquadTableProps): string => {
  const { players, showIcons = true, style = {} } = props;

  const { goalkeepers, defenders, midfielders, forwards } = groupPlayersByPosition(players);

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '20px 0',
    ...style,
  };

  const styleString = Object.entries(tableStyle)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');

  return `
    <table style="${styleString}" cellpadding="0" cellspacing="0">
        ${generatePositionRow(PlayerPosition.GOALKEEPER, goalkeepers, showIcons)}
        ${generatePositionRow(PlayerPosition.DEFENDER, defenders, showIcons)}
        ${generatePositionRow(PlayerPosition.MIDFIELDER, midfielders, showIcons)}
        ${generatePositionRow(PlayerPosition.FORWARD, forwards, showIcons)}
    </table>`;
};

/**
 * Export position icons and labels for use in other components
 */
export { POSITION_ICONS, POSITION_LABELS };
