import { describe, it, expect, beforeEach } from 'vitest';
import type { Ref } from 'vue';
import {
  createMockDraftedTeamWithPlayers,
  createMockPlayerWithStats,
  createMockTransferWithStats,
} from '@/tests/factories';
import { useWeeklyStatistics } from '@/composables/useWeeklyStatistics';
import type { DraftedTeamWithPlayers } from '@/types/DraftedTeam';

describe('useWeeklyStatistics', () => {
  let mockDraftedTeam: Ref<DraftedTeamWithPlayers>;
  let mockSelectedGameweek: Ref<number>;

  beforeEach(() => {
    // Reset global watchEffects array
    global._watchEffects = [];

    // Create fresh reactive references for each test
    mockDraftedTeam = global._testMocks.ref(createMockDraftedTeamWithPlayers()) as Ref<DraftedTeamWithPlayers>;
    mockSelectedGameweek = global._testMocks.ref(1) as Ref<number>;
  });

  describe('Basic Points Calculation', () => {
    it('should calculate total points from all players', () => {
      // Arrange: Create team with 3 players with different points
      const team = createMockDraftedTeamWithPlayers({
        players: [
          createMockPlayerWithStats({ points: 5, playerId: 1 }),
          createMockPlayerWithStats({ points: 8, playerId: 2 }),
          createMockPlayerWithStats({ points: 3, playerId: 3 }),
        ],
      });

      mockDraftedTeam.value = team;

      // Act: Use the composable
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Total points should be sum of all player points
      expect(calculatedWeeklyStats.value.points).toBe(16);
    });

    it('should handle zero points correctly', () => {
      // Arrange: Create team with players having zero points
      const team = createMockDraftedTeamWithPlayers({
        players: [
          createMockPlayerWithStats({ points: 0, playerId: 1 }),
          createMockPlayerWithStats({ points: 0, playerId: 2 }),
        ],
      });

      mockDraftedTeam.value = team;

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert
      expect(calculatedWeeklyStats.value.points).toBe(0);
    });

    it('should handle undefined/null points gracefully', () => {
      // Arrange: Create team with players having null/undefined points
      const team = createMockDraftedTeamWithPlayers({
        players: [
          createMockPlayerWithStats({ points: undefined, playerId: 1 }),
          createMockPlayerWithStats({ points: 5, playerId: 2 }),
        ],
      });

      mockDraftedTeam.value = team;

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Should treat undefined as 0
      expect(calculatedWeeklyStats.value.points).toBe(5);
    });
  });

  describe('Goals, Assists, and Cards Calculation', () => {
    it('should aggregate goals and assists correctly', () => {
      // Arrange: Create team with different stats
      const team = createMockDraftedTeamWithPlayers({
        players: [
          createMockPlayerWithStats({
            goals: 2,
            assists: 1,
            playerId: 1,
          }),
          createMockPlayerWithStats({
            goals: 1,
            assists: 3,
            playerId: 2,
          }),
          createMockPlayerWithStats({
            goals: 0,
            assists: 0,
            playerId: 3,
          }),
        ],
      });

      mockDraftedTeam.value = team;

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert
      expect(calculatedWeeklyStats.value.goals).toBe(3); // 2 + 1 + 0
      expect(calculatedWeeklyStats.value.assists).toBe(4); // 1 + 3 + 0
    });

    it('should count red cards and clean sheets correctly', () => {
      // Arrange: Create team with cards and clean sheets
      const team = createMockDraftedTeamWithPlayers({
        players: [
          createMockPlayerWithStats({
            redcards: 1, // Should count as 1
            cleansheets: 1, // Should count as 1
            playerId: 1,
          }),
          createMockPlayerWithStats({
            redcards: 0, // Should count as 0
            cleansheets: 1, // Should count as 1
            playerId: 2,
          }),
        ],
      });

      mockDraftedTeam.value = team;

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Red cards and clean sheets are binary (0 or 1 per player)
      expect(calculatedWeeklyStats.value.red_cards).toBe(1); // 1 + 0
      expect(calculatedWeeklyStats.value.clean_sheets).toBe(2); // 1 + 1
    });

    it('should handle null stats gracefully', () => {
      // Arrange: Create team with null stats (common for some positions)
      const team = createMockDraftedTeamWithPlayers({
        players: [
          createMockPlayerWithStats({
            goals: undefined,
            assists: undefined,
            redcards: undefined,
            cleansheets: undefined,
            playerId: 1,
          }),
          createMockPlayerWithStats({
            goals: 1,
            assists: 2,
            redcards: 0,
            cleansheets: 1,
            playerId: 2,
          }),
        ],
      });

      mockDraftedTeam.value = team;

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Should handle null/undefined gracefully
      expect(calculatedWeeklyStats.value.goals).toBe(1);
      expect(calculatedWeeklyStats.value.assists).toBe(2);
      expect(calculatedWeeklyStats.value.red_cards).toBe(0);
      expect(calculatedWeeklyStats.value.clean_sheets).toBe(1);
    });
  });

  describe('Transfer Scenarios', () => {
    it('should use transfer data when transfer_week <= selectedGameweek', () => {
      // Arrange: Player with transfer in week 2, currently viewing week 3
      const player = createMockPlayerWithStats({
        points: 5, // Original player points
        playerId: 1,
      });
      player.transfers = [
        createMockTransferWithStats(2, {
          points: 10, // Transfer player points
          playerId: 2,
        }),
      ];

      const team = createMockDraftedTeamWithPlayers({
        players: [player],
      });

      mockDraftedTeam.value = team;
      mockSelectedGameweek.value = 3; // After transfer week

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Should use transfer points (10), not original points (5)
      expect(calculatedWeeklyStats.value.points).toBe(10);
    });

    it('should use original player data when transfer_week > selectedGameweek', () => {
      // Arrange: Player with transfer in week 5, currently viewing week 3
      const player = createMockPlayerWithStats({
        points: 5, // Original player points
        playerId: 1,
      });
      player.transfers = [
        createMockTransferWithStats(5, {
          points: 10, // Transfer player points
          playerId: 2,
        }),
      ];

      const team = createMockDraftedTeamWithPlayers({
        players: [player],
      });

      mockDraftedTeam.value = team;
      mockSelectedGameweek.value = 3; // Before transfer week

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Should use original points (5), not transfer points (10)
      expect(calculatedWeeklyStats.value.points).toBe(5);
    });

    it('should use most recent transfer when multiple transfers exist', () => {
      // Arrange: Player with multiple transfers
      const player = createMockPlayerWithStats({
        points: 3, // Original player points
        playerId: 1,
      });
      player.transfers = [
        createMockTransferWithStats(2, {
          points: 6, // First transfer
          playerId: 2,
          transferId: 1,
        }),
        createMockTransferWithStats(4, {
          points: 9, // Most recent transfer
          playerId: 3,
          transferId: 2,
        }),
        createMockTransferWithStats(1, {
          points: 12, // Earliest transfer
          playerId: 4,
          transferId: 3,
        }),
      ];

      const team = createMockDraftedTeamWithPlayers({
        players: [player],
      });

      mockDraftedTeam.value = team;
      mockSelectedGameweek.value = 5; // After all transfers

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Should use most recent transfer (week 4, points 9)
      expect(calculatedWeeklyStats.value.points).toBe(9);
    });
  });

  describe('Selected Player/Transfer Overrides', () => {
    it('should prioritize selected player over transfers', () => {
      // Arrange: Player with transfer but original player is selected
      const player = createMockPlayerWithStats({
        points: 7, // Original player points
        selected: true, // Original player is selected
        playerId: 1,
      });
      player.transfers = [
        createMockTransferWithStats(2, {
          points: 15, // Transfer player points
          selected: false, // Transfer is not selected
          playerId: 2,
        }),
      ];

      const team = createMockDraftedTeamWithPlayers({
        players: [player],
      });

      mockDraftedTeam.value = team;
      mockSelectedGameweek.value = 5; // After transfer week

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Should use selected original player (7), not transfer (15)
      expect(calculatedWeeklyStats.value.points).toBe(7);
    });

    it('should use selected transfer over other transfers', () => {
      // Arrange: Player with multiple transfers, one selected
      const player = createMockPlayerWithStats({
        points: 4, // Original player points
        selected: false,
        playerId: 1,
      });
      player.transfers = [
        createMockTransferWithStats(2, {
          points: 8, // First transfer
          selected: false,
          playerId: 2,
          transferId: 1,
        }),
        createMockTransferWithStats(4, {
          points: 12, // Selected transfer
          selected: true,
          playerId: 3,
          transferId: 2,
        }),
      ];

      const team = createMockDraftedTeamWithPlayers({
        players: [player],
      });

      mockDraftedTeam.value = team;
      mockSelectedGameweek.value = 5; // After all transfers

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Should use selected transfer (12)
      expect(calculatedWeeklyStats.value.points).toBe(12);
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle empty player list', () => {
      // Arrange: Team with no players
      const team = createMockDraftedTeamWithPlayers({
        players: [],
      });

      mockDraftedTeam.value = team;

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Should return zero values
      expect(calculatedWeeklyStats.value.points).toBe(0);
      expect(calculatedWeeklyStats.value.goals).toBe(null);
      expect(calculatedWeeklyStats.value.assists).toBe(null);
    });

    it('should handle mixed scenarios: some players with transfers, some without', () => {
      // Arrange: Mixed team scenario
      const playerWithTransfer = createMockPlayerWithStats({
        points: 3,
        goals: 1,
        playerId: 1,
      });
      playerWithTransfer.transfers = [
        createMockTransferWithStats(2, {
          points: 8,
          goals: 2,
          playerId: 2,
        }),
      ];

      const playerWithoutTransfer = createMockPlayerWithStats({
        points: 6,
        assists: 1,
        playerId: 3,
      });

      const team = createMockDraftedTeamWithPlayers({
        players: [playerWithTransfer, playerWithoutTransfer],
      });

      mockDraftedTeam.value = team;
      mockSelectedGameweek.value = 3; // After transfer week

      // Act
      const { calculatedWeeklyStats } = useWeeklyStatistics(mockDraftedTeam, mockSelectedGameweek);

      // Assert: Should combine transfer stats and original player stats
      expect(calculatedWeeklyStats.value.points).toBe(14); // 8 (transfer) + 6 (original)
      expect(calculatedWeeklyStats.value.goals).toBe(2); // 2 (from transfer)
      expect(calculatedWeeklyStats.value.assists).toBe(1); // 1 (from original player)
    });
  });
});
