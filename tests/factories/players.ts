import type { DraftedTeamPlayer } from '@/types/DraftedTeamPlayer';
import type { Player } from '@/types/Player';
import { PlayerPosition } from '@/types/PlayerPosition';
import type { DraftedPlayerWithWeeklyStats, DraftedTransferWithWeeklyStats } from '@/types/DraftedPlayer';
import type { DraftedTeamWithPlayers } from '@/types/DraftedTeam';
import type { Tables } from '@/types/database.types';

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

// =================================================================
// WEEKLY STATISTICS FACTORY FUNCTIONS
// =================================================================

/**
 * Factory function for creating mock player view data for testing.
 * Uses realistic defaults based on the actual players_view structure.
 */
export const createMockPlayerViewData = (
  overrides?: Partial<Tables<'players_view'>>,
): Tables<'players_view'> => {
  return {
    player_id: 1,
    first_name: 'Test',
    second_name: 'Player',
    position: 1, // Position should be number based on the actual type
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
 * Factory function for creating mock DraftedPlayerWithWeeklyStats.
 * Represents a drafted player with their weekly statistics data.
 */
export const createMockDraftedPlayerWithWeeklyStats = (
  overrides?: Partial<DraftedPlayerWithWeeklyStats>,
): DraftedPlayerWithWeeklyStats => {
  return {
    drafted_player_id: 1,
    transfers: [],
    data: createMockPlayerViewData(),
    points: 0,
    week_goals: 0,
    week_assists: 0,
    week_redcards: 0, // Number - 0 = no red card, 1+ = red card(s)
    week_cleansheets: 0, // Number - 0 = no clean sheet, 1+ = clean sheet(s)
    selected: false,
    ...overrides,
  };
};

/**
 * Factory function for creating mock DraftedTransferWithWeeklyStats.
 * Represents a transfer with weekly statistics data.
 */
export const createMockDraftedTransferWithWeeklyStats = (
  overrides?: Partial<DraftedTransferWithWeeklyStats>,
): DraftedTransferWithWeeklyStats => {
  return {
    drafted_transfer_id: 1,
    active_transfer_expiry: new Date(),
    transfer_week: 1,
    data: createMockPlayerViewData(),
    selected: false,
    points: 0,
    week_goals: 0,
    week_assists: 0,
    week_redcards: 0, // Number - 0 = no red card, 1+ = red card(s)
    week_cleansheets: 0, // Number - 0 = no clean sheet, 1+ = clean sheet(s)
    ...overrides,
  };
};

/**
 * Factory function for creating mock DraftedTeamWithPlayers.
 * Used for testing the useWeeklyStatistics composable.
 */
export const createMockDraftedTeamWithPlayers = (
  overrides?: Partial<DraftedTeamWithPlayers>,
): DraftedTeamWithPlayers => {
  return {
    drafted_team_id: 1,
    team_name: 'Test Team',
    team_owner: 'Test Owner',
    team_email: 'test@example.com',
    allowed_transfers: true,
    total_team_value: 90,
    is_invalid_team: false,
    active_season: '1',
    players: [],
    contact_number: null,
    created_at: new Date().toISOString(),
    updated_at: null,
    edited_count: null,
    key: 'test-key',
    allow_communication: true,
    ...overrides,
  };
};

/**
 * Creates a mock player with specific weekly statistics.
 * Useful for testing points calculation scenarios.
 */
export const createMockPlayerWithStats = (stats: {
  points?: number;
  goals?: number;
  assists?: number;
  redcards?: number;
  cleansheets?: number;
  playerId?: number;
  selected?: boolean;
}) => {
  return createMockDraftedPlayerWithWeeklyStats({
    drafted_player_id: stats.playerId ?? 1,
    data: createMockPlayerViewData({
      player_id: stats.playerId ?? 1,
      first_name: 'Player',
      second_name: String(stats.playerId ?? 1),
    }),
    points: stats.points ?? 0,
    week_goals: stats.goals ?? 0,
    week_assists: stats.assists ?? 0,
    week_redcards: stats.redcards ?? 0,
    week_cleansheets: stats.cleansheets ?? 0,
    selected: stats.selected ?? false,
  });
};

/**
 * Creates a mock transfer with specific weekly statistics and transfer week.
 * Useful for testing transfer timing scenarios.
 */
export const createMockTransferWithStats = (transferWeek: number, stats: {
  points?: number;
  goals?: number;
  assists?: number;
  redcards?: number;
  cleansheets?: number;
  transferId?: number;
  playerId?: number;
  selected?: boolean;
}) => {
  return createMockDraftedTransferWithWeeklyStats({
    drafted_transfer_id: stats.transferId ?? 1,
    transfer_week: transferWeek,
    data: createMockPlayerViewData({
      player_id: stats.playerId ?? 2,
      first_name: 'Transfer',
      second_name: String(stats.playerId ?? 2),
    }),
    points: stats.points ?? 0,
    week_goals: stats.goals ?? 0,
    week_assists: stats.assists ?? 0,
    week_redcards: stats.redcards ?? 0,
    week_cleansheets: stats.cleansheets ?? 0,
    selected: stats.selected ?? false,
  });
};
