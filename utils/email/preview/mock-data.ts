import type { UserEmailData, AdminEmailData } from '../types';
import type { DraftedTeamPlayer } from '~/types/DraftedTeamPlayer';
import { PlayerPosition } from '~/types/PlayerPosition';
import type { Player } from '~/types/Player';

/**
 * Mock player data with realistic names and values
 */
const MOCK_PLAYERS = {
  goalkeepers: [
    { player_id: 1, web_name: 'Alisson', cost: 55, team: 11 },
    { player_id: 2, web_name: 'Ederson', cost: 55, team: 12 },
    { player_id: 3, web_name: 'Raya', cost: 50, team: 1 },
    { player_id: 4, web_name: 'Pickford', cost: 45, team: 7 },
  ],
  defenders: [
    { player_id: 5, web_name: 'van Dijk', cost: 65, team: 11 },
    { player_id: 6, web_name: 'Saliba', cost: 60, team: 1 },
    { player_id: 7, web_name: 'Gabriel', cost: 60, team: 1 },
    { player_id: 8, web_name: 'Robertson', cost: 60, team: 11 },
    { player_id: 9, web_name: 'Walker', cost: 55, team: 12 },
    { player_id: 10, web_name: 'White', cost: 55, team: 1 },
    { player_id: 11, web_name: 'Stones', cost: 55, team: 12 },
    { player_id: 12, web_name: 'Timber', cost: 50, team: 1 },
    { player_id: 13, web_name: 'Digne', cost: 45, team: 2 },
    { player_id: 14, web_name: 'Mykolenko', cost: 40, team: 7 },
  ],
  midfielders: [
    { player_id: 15, web_name: 'Salah', cost: 130, team: 11 },
    { player_id: 16, web_name: 'Haaland', cost: 150, team: 12 },
    { player_id: 17, web_name: 'Son', cost: 100, team: 18 },
    { player_id: 18, web_name: 'Saka', cost: 100, team: 1 },
    { player_id: 19, web_name: 'Palmer', cost: 110, team: 4 },
    { player_id: 20, web_name: 'Odegaard', cost: 85, team: 1 },
    { player_id: 21, web_name: 'Foden', cost: 90, team: 12 },
    { player_id: 22, web_name: 'Bruno F.', cost: 105, team: 13 },
    { player_id: 23, web_name: 'Maddison', cost: 75, team: 18 },
    { player_id: 24, web_name: 'Bowen', cost: 75, team: 20 },
  ],
  forwards: [
    { player_id: 25, web_name: 'Nunez', cost: 75, team: 11 },
    { player_id: 26, web_name: 'Jesus', cost: 70, team: 1 },
    { player_id: 27, web_name: 'Richarlison', cost: 65, team: 18 },
    { player_id: 28, web_name: 'Calvert-Lewin', cost: 55, team: 7 },
    { player_id: 29, web_name: 'Antonio', cost: 50, team: 20 },
    { player_id: 30, web_name: 'Welbeck', cost: 55, team: 3 },
  ],
} as const;

/**
 * Creates a mock Player object with minimal required fields
 */
const createMockPlayer = (data: { player_id: number; web_name: string; cost: number; team: number }): Player => {
  return {
    player_id: data.player_id,
    web_name: data.web_name,
    cost: data.cost,
    team: data.team,
    // Add other required Player fields with sensible defaults
    first_name: data.web_name.split(' ')[0] || data.web_name,
    second_name: data.web_name.split(' ').slice(1).join(' ') || '',
    position: 1, // Will be overridden based on position
    assists: Math.floor(Math.random() * 10),
    clean_sheets: Math.floor(Math.random() * 15),
    code: data.player_id * 1000,
    goals_scored: Math.floor(Math.random() * 20),
    image: `${data.player_id}.jpg`,
    image_large: `${data.player_id}_large.jpg`,
    is_unavailable: false,
    news: '',
    red_cards: 0,
    status: 'a',
    team_name: 'Team Name',
    team_short_name: 'TEA',
    unavailable_for_season: false,
  } as Player;
};

/**
 * Creates a complete mock team with all 11 players
 */
export const createMockTeam = (scenario: 'budget' | 'premium' | 'balanced' = 'balanced'): DraftedTeamPlayer[] => {
  const team: DraftedTeamPlayer[] = [];

  // Select players based on scenario
  let selectedPlayers: { position: PlayerPosition; player: { player_id: number; web_name: string; cost: number; team: number } }[];

  switch (scenario) {
    case 'budget':
      // Budget team targeting ~82 total value for transfers, ~87 for non-transfers
      selectedPlayers = [
        { position: PlayerPosition.GOALKEEPER, player: MOCK_PLAYERS.goalkeepers[3] }, // Pickford (45)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[8] }, // Digne (45)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[9] }, // Mykolenko (40)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[7] }, // Timber (50)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[8] }, // Digne again - need to fix
        { position: PlayerPosition.MIDFIELDER, player: MOCK_PLAYERS.midfielders[8] }, // Maddison (75)
        { position: PlayerPosition.MIDFIELDER, player: MOCK_PLAYERS.midfielders[9] }, // Bowen (75)
        { position: PlayerPosition.MIDFIELDER, player: MOCK_PLAYERS.midfielders[5] }, // Odegaard (85)
        { position: PlayerPosition.FORWARD, player: MOCK_PLAYERS.forwards[3] }, // Calvert-Lewin (55)
        { position: PlayerPosition.FORWARD, player: MOCK_PLAYERS.forwards[4] }, // Antonio (50)
        { position: PlayerPosition.FORWARD, player: MOCK_PLAYERS.forwards[5] }, // Welbeck (55)
      ];
      break;

    case 'premium':
      // Premium team with transfers - should be around 85 total
      selectedPlayers = [
        { position: PlayerPosition.GOALKEEPER, player: MOCK_PLAYERS.goalkeepers[2] }, // Raya (50)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[1] }, // Saliba (60)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[4] }, // Walker (55)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[5] }, // White (55)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[8] }, // Digne (45)
        { position: PlayerPosition.MIDFIELDER, player: MOCK_PLAYERS.midfielders[3] }, // Saka (100)
        { position: PlayerPosition.MIDFIELDER, player: MOCK_PLAYERS.midfielders[5] }, // Odegaard (85)
        { position: PlayerPosition.MIDFIELDER, player: MOCK_PLAYERS.midfielders[6] }, // Foden (90)
        { position: PlayerPosition.FORWARD, player: MOCK_PLAYERS.forwards[1] }, // Jesus (70)
        { position: PlayerPosition.FORWARD, player: MOCK_PLAYERS.forwards[2] }, // Richarlison (65)
        { position: PlayerPosition.FORWARD, player: MOCK_PLAYERS.forwards[3] }, // Calvert-Lewin (55)
      ];
      break;

    default: // balanced
      // Balanced team targeting ~89 total value
      selectedPlayers = [
        { position: PlayerPosition.GOALKEEPER, player: MOCK_PLAYERS.goalkeepers[2] }, // Raya (50)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[1] }, // Saliba (60)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[4] }, // Walker (55)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[5] }, // White (55)
        { position: PlayerPosition.DEFENDER, player: MOCK_PLAYERS.defenders[7] }, // Timber (50)
        { position: PlayerPosition.MIDFIELDER, player: MOCK_PLAYERS.midfielders[3] }, // Saka (100)
        { position: PlayerPosition.MIDFIELDER, player: MOCK_PLAYERS.midfielders[5] }, // Odegaard (85)
        { position: PlayerPosition.MIDFIELDER, player: MOCK_PLAYERS.midfielders[8] }, // Maddison (75)
        { position: PlayerPosition.FORWARD, player: MOCK_PLAYERS.forwards[1] }, // Jesus (70)
        { position: PlayerPosition.FORWARD, player: MOCK_PLAYERS.forwards[2] }, // Richarlison (65)
        { position: PlayerPosition.FORWARD, player: MOCK_PLAYERS.forwards[5] }, // Welbeck (55)
      ];
  }

  // Convert to DraftedTeamPlayer format
  selectedPlayers.forEach(({ position, player }) => {
    team.push({
      position,
      selectedPlayer: createMockPlayer(player),
    });
  });

  return team;
};

/**
 * Calculates total team value
 */
export const calculateTeamValue = (team: DraftedTeamPlayer[]): number => {
  return team.reduce((total, player) => {
    return total + (player.selectedPlayer?.cost || 0);
  }, 0) / 10; // Convert from tenths to actual value
};

/**
 * Mock user email data scenarios
 */
export const createMockUserEmailData = (scenario: 'budget' | 'premium' | 'balanced' = 'balanced'): UserEmailData => {
  const teamNames = {
    budget: 'Bargain Hunters FC',
    premium: 'Galactico United',
    balanced: 'The Strategists',
  };

  // Set transfer status - premium always has transfers to demonstrate 85 limit
  const allowedTransfers = scenario === 'premium';

  const team = createMockTeam(scenario);
  const teamValue = calculateTeamValue(team);

  return {
    team_name: teamNames[scenario],
    allowed_transfers: allowedTransfers,
    total_team_value: teamValue,
    key: `mock-${scenario}-${Date.now()}`,
  };
};

/**
 * Mock admin email data scenarios
 */
export const createMockAdminEmailData = (scenario: 'budget' | 'premium' | 'balanced' = 'balanced'): AdminEmailData => {
  const userData = createMockUserEmailData(scenario);

  const ownerNames = {
    budget: 'Sam Wilson',
    premium: 'Alexandra Sterling',
    balanced: 'Jordan Martinez',
  };

  const emails = {
    budget: 'sam.wilson@email.com',
    premium: 'alex.sterling@email.com',
    balanced: 'jordan.martinez@email.com',
  };

  return {
    ...userData,
    team_owner: ownerNames[scenario],
    team_email: emails[scenario],
  };
};

/**
 * Export mock scenarios for easy access
 */
export const MOCK_SCENARIOS = {
  budget: {
    name: 'Budget Team',
    description: 'Lower-cost players, focused on value',
  },
  premium: {
    name: 'Premium Team',
    description: 'High-value players, premium selections',
  },
  balanced: {
    name: 'Balanced Team',
    description: 'Mix of premium and budget players',
  },
} as const;

export type MockScenario = keyof typeof MOCK_SCENARIOS;
