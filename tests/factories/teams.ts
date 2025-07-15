import type { DraftedTeam } from '@/types/DraftedTeam';
import type { TablesInsert, Tables } from '@/types/database.types';

/**
 * Factory function for creating mock DraftedTeam data for testing.
 * Uses sensible defaults and allows partial overrides.
 */
export const createMockDraftedTeam = (
  overrides?: Partial<DraftedTeam>,
): DraftedTeam => {
  return {
    drafted_team_id: 1,
    team_name: 'Test Team FC',
    team_owner: 'Test Owner',
    team_email: 'test@example.com',
    allowed_transfers: false,
    players: [],
    total_team_value: 0,
    is_invalid_team: false,
    ...overrides,
  };
};

/**
 * Factory function for creating mock team insert data for testing.
 * Used for creating new teams before they have database IDs.
 */
export const createMockTeamInsertData = (
  overrides?: Partial<TablesInsert<'drafted_teams'>>,
): TablesInsert<'drafted_teams'> => {
  return {
    active_season: '24-25',
    team_name: 'Test Team FC',
    team_owner: 'Test Owner',
    team_email: 'test@example.com',
    allowed_transfers: false,
    total_team_value: 0,
    ...overrides,
  };
};

/**
 * Factory function for creating mock team table data for testing.
 * Used for existing teams with database keys.
 */
export const createMockTeamTableData = (
  overrides?: Partial<Tables<'drafted_teams'>>,
): Tables<'drafted_teams'> => {
  return {
    key: '1',
    drafted_team_id: 1,
    active_season: '24-25',
    team_name: 'Test Team FC',
    team_owner: 'Test Owner',
    team_email: 'test@example.com',
    contact_number: null,
    allow_communication: false,
    allowed_transfers: false,
    total_team_value: 0,
    created_at: '2025-01-12T10:00:00Z',
    updated_at: null,
    edited_count: null,
    ...overrides,
  };
};
