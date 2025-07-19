import type { DraftedTeamPlayer } from '@/types/DraftedTeamPlayer';
import type { Player } from '@/types/Player';
import { PlayerPosition } from '@/types/PlayerPosition';

/**
 * Factory function for creating mock Player data for testing.
 * Uses sensible defaults based on real player data structure.
 */
export const createMockPlayer = (
  overrides?: Partial<Player>,
): Player => {
  return {
    player_id: 1,
    first_name: 'Test',
    second_name: 'Player',
    position: PlayerPosition.MIDFIELDER,
    team: 1,
    team_name: 'Test FC',
    team_short_name: 'TST',
    cost: 5.0,
    assists: 0,
    clean_sheets: 0,
    code: 1001,
    goals_scored: 0,
    image: 'test.jpg',
    image_large: 'test_large.jpg',
    is_unavailable: false,
    unavailable_for_season: false,
    news: '',
    red_cards: 0,
    status: 'a',
    web_name: 'Test Player',
    minutes: 90,
    ...overrides,
  };
};

/**
 * Factory function for creating mock DraftedTeamPlayer data for testing.
 * Represents a player slot in the team builder UI.
 */
export const createMockDraftedTeamPlayer = (
  overrides?: Partial<DraftedTeamPlayer>,
): DraftedTeamPlayer => {
  return {
    position: PlayerPosition.MIDFIELDER,
    selectedPlayer: null,
    ...overrides,
  };
};

/**
 * Factory function for creating a populated DraftedTeamPlayer with a selected player.
 * Useful for testing scenarios where players have been selected.
 */
export const createMockDraftedTeamPlayerWithSelection = (
  playerOverrides?: Partial<Player>,
  slotOverrides?: Partial<DraftedTeamPlayer>,
): DraftedTeamPlayer => {
  const mockPlayer = createMockPlayer(playerOverrides);
  return createMockDraftedTeamPlayer({
    position: mockPlayer.position,
    selectedPlayer: mockPlayer,
    ...slotOverrides,
  });
};

/**
 * Factory function for creating a complete team structure with 11 empty slots.
 * Follows the default team structure: 1 GK, 4 DEF, 3 MID, 3 FWD.
 */
export const createMockTeamStructure = (): DraftedTeamPlayer[] => {
  return [
    // Goalkeeper
    createMockDraftedTeamPlayer({ position: PlayerPosition.GOALKEEPER }),
    // Defenders
    createMockDraftedTeamPlayer({ position: PlayerPosition.DEFENDER }),
    createMockDraftedTeamPlayer({ position: PlayerPosition.DEFENDER }),
    createMockDraftedTeamPlayer({ position: PlayerPosition.DEFENDER }),
    createMockDraftedTeamPlayer({ position: PlayerPosition.DEFENDER }),
    // Midfielders
    createMockDraftedTeamPlayer({ position: PlayerPosition.MIDFIELDER }),
    createMockDraftedTeamPlayer({ position: PlayerPosition.MIDFIELDER }),
    createMockDraftedTeamPlayer({ position: PlayerPosition.MIDFIELDER }),
    // Forwards
    createMockDraftedTeamPlayer({ position: PlayerPosition.FORWARD }),
    createMockDraftedTeamPlayer({ position: PlayerPosition.FORWARD }),
    createMockDraftedTeamPlayer({ position: PlayerPosition.FORWARD }),
  ];
};

/**
 * Factory function for creating a team with players of different costs.
 * Useful for testing budget calculations.
 */
export const createMockTeamWithPlayers = (playerCosts: number[]): DraftedTeamPlayer[] => {
  const structure = createMockTeamStructure();

  return structure.map((slot, index) => {
    if (index < playerCosts.length) {
      const player = createMockPlayer({
        player_id: index + 1,
        first_name: `Player`,
        second_name: `${index + 1}`,
        web_name: `Player ${index + 1}`,
        position: slot.position,
        cost: playerCosts[index],
        team_short_name: `T${index + 1}`,
      });

      return {
        ...slot,
        selectedPlayer: player,
      };
    }
    return slot;
  });
};
