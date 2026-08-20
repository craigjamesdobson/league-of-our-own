// Central exports for all test fixtures
export {
  createMockDraftedTeam,
  createMockTeamAdminMetadata,
  createMockTeamInsertData,
  createMockTeamTableData,
} from './teams';

export {
  createMockPlayer,
  createMockHistoricalCleanSheetStats,
  createMockDraftedTeamPlayer,
  createMockDraftedTeamPlayerWithSelection,
  createMockTeamStructure,
  createMockTeamWithPlayers,
  // Weekly statistics factory functions
  createMockPlayerViewData,
  createMockDraftedPlayerWithWeeklyStats,
  createMockDraftedTransferWithWeeklyStats,
  createMockDraftedTeamWithPlayers,
  createMockPlayerWithStats,
  createMockTransferWithStats,
} from './players';

export { createMockFplTeams } from './fplTeams';
export { createMockFplPlayers } from './fplPlayers';
export { createMockFplFixtures } from './fplFixtures';
export { createMockFplHistoryPast } from './fplPreviousSeason';
