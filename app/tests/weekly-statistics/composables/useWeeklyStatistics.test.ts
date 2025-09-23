import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import {
  createMockDraftedTeamWithPlayers,
  createMockPlayerWithStats,
  createMockTransferWithStats,
} from '@/tests/factories';
import { useWeeklyStats } from '@/composables/useWeeklyStats';
import { withSetup } from '@/tests/setup';

describe('useWeeklyStats', () => {
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

      // Act: Use the composable with real Vue reactivity
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(1)),
      );

      // Assert: Total points should be sum of all player points
      expect(result.calculatedWeeklyStats.value.points).toBe(16);

      // Cleanup
      app.unmount();
    });

    it('should handle zero points correctly', () => {
      // Arrange: Create team with players having zero points
      const team = createMockDraftedTeamWithPlayers({
        players: [
          createMockPlayerWithStats({ points: 0, playerId: 1 }),
          createMockPlayerWithStats({ points: 0, playerId: 2 }),
        ],
      });

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(1)),
      );

      // Assert
      expect(result.calculatedWeeklyStats.value.points).toBe(0);

      // Cleanup
      app.unmount();
    });

    it('should handle undefined/null points gracefully', () => {
      // Arrange: Create team with players having null/undefined points
      const team = createMockDraftedTeamWithPlayers({
        players: [
          createMockPlayerWithStats({ points: undefined, playerId: 1 }),
          createMockPlayerWithStats({ points: 5, playerId: 2 }),
        ],
      });

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(1)),
      );

      // Assert: Should treat undefined as 0
      expect(result.calculatedWeeklyStats.value.points).toBe(5);

      // Cleanup
      app.unmount();
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

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(1)),
      );

      // Assert
      expect(result.calculatedWeeklyStats.value.goals).toBe(3); // 2 + 1 + 0
      expect(result.calculatedWeeklyStats.value.assists).toBe(4); // 1 + 3 + 0

      // Cleanup
      app.unmount();
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

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(1)),
      );

      // Assert: Red cards and clean sheets are binary (0 or 1 per player)
      expect(result.calculatedWeeklyStats.value.red_cards).toBe(1); // 1 + 0
      expect(result.calculatedWeeklyStats.value.clean_sheets).toBe(2); // 1 + 1

      // Cleanup
      app.unmount();
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

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(1)),
      );

      // Assert: Should handle null/undefined gracefully
      expect(result.calculatedWeeklyStats.value.goals).toBe(1);
      expect(result.calculatedWeeklyStats.value.assists).toBe(2);
      expect(result.calculatedWeeklyStats.value.red_cards).toBe(0);
      expect(result.calculatedWeeklyStats.value.clean_sheets).toBe(1);

      // Cleanup
      app.unmount();
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

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(3)), // After transfer week
      );

      // Assert: Should use transfer points (10), not original points (5)
      expect(result.calculatedWeeklyStats.value.points).toBe(10);

      // Cleanup
      app.unmount();
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

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(3)), // Before transfer week
      );

      // Assert: Should use original points (5), not transfer points (10)
      expect(result.calculatedWeeklyStats.value.points).toBe(5);

      // Cleanup
      app.unmount();
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

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(5)), // After all transfers
      );

      // Assert: Should use most recent transfer (week 4, points 9)
      expect(result.calculatedWeeklyStats.value.points).toBe(9);

      // Cleanup
      app.unmount();
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

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(5)), // After transfer week
      );

      // Assert: Should use selected original player (7), not transfer (15)
      expect(result.calculatedWeeklyStats.value.points).toBe(7);

      // Cleanup
      app.unmount();
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

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(5)), // After all transfers
      );

      // Assert: Should use selected transfer (12)
      expect(result.calculatedWeeklyStats.value.points).toBe(12);

      // Cleanup
      app.unmount();
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle empty player list', () => {
      // Arrange: Team with no players
      const team = createMockDraftedTeamWithPlayers({
        players: [],
      });

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(1)),
      );

      // Assert: Should return zero values
      expect(result.calculatedWeeklyStats.value.points).toBe(0);
      expect(result.calculatedWeeklyStats.value.goals).toBe(null);
      expect(result.calculatedWeeklyStats.value.assists).toBe(null);

      // Cleanup
      app.unmount();
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

      // Act
      const [result, app] = withSetup(() =>
        useWeeklyStats(ref(team), ref(3)), // After transfer week
      );

      // Assert: Should combine transfer stats and original player stats
      expect(result.calculatedWeeklyStats.value.points).toBe(14); // 8 (transfer) + 6 (original)
      expect(result.calculatedWeeklyStats.value.goals).toBe(2); // 2 (from transfer)
      expect(result.calculatedWeeklyStats.value.assists).toBe(1); // 1 (from original player)

      // Cleanup
      app.unmount();
    });
  });
});
