import type { TablesInsert } from './database-generated.types';
import type { Player } from './Player';
import type { PlayerPosition } from './PlayerPosition';

/**
 * Represents a player slot in the team builder UI.
 * Combines team structure position with optional selected player data.
 */
export interface DraftedTeamPlayer {
  /** Database ID for existing drafted players (used when editing existing teams) */
  draftedPlayerID?: TablesInsert<'drafted_players'>['drafted_player_id'];

  /** The position this slot represents in the team structure */
  position: PlayerPosition;

  /** The selected player data, null if slot is empty during team building */
  selectedPlayer: Player | null;
}
