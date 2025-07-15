import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createMockTeamInsertData,
  createMockTeamWithPlayers,
} from '@/tests/factories';
import { useTeamBuilder } from '@/composables/useTeamBuilder';

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}));

vi.mock('@/stores/draftedTeams', () => ({
  useDraftedTeamsStore: () => ({
    addDraftedTeam: vi.fn(),
  }),
}));

vi.mock('@/utils/utility', () => ({
  delay: vi.fn(),
}));

vi.mock('@/pages/team-builder/email', () => ({
  generateAdminEmail: vi.fn(),
  generateTeamEmail: vi.fn(),
}));

describe('useTeamBuilder - Budget Calculations', () => {
  let teamBuilder: ReturnType<typeof useTeamBuilder>;

  beforeEach(() => {
    if (global._watchEffects) {
      global._watchEffects.length = 0;
    }
    teamBuilder = useTeamBuilder();
  });

  const triggerWatchEffects = () => {
    if (global._watchEffects) {
      global._watchEffects.forEach((effect: () => void) => effect());
    }
  };

  describe('Budget allocation based on transfer allowance', () => {
    it('should set budget to 90 when transfers are not allowed', () => {
      const teamWithNoTransfers = createMockTeamInsertData({
        allowed_transfers: false,
      });

      teamBuilder.draftedTeamData.value = teamWithNoTransfers;

      expect(teamBuilder.teamBudget.value).toBe(90);
    });

    it('should set budget to 85 when transfers are allowed', () => {
      const teamWithTransfers = createMockTeamInsertData({
        allowed_transfers: true,
      });

      teamBuilder.draftedTeamData.value = teamWithTransfers;

      expect(teamBuilder.teamBudget.value).toBe(85);
    });
  });

  describe('Team value calculation from selected players', () => {
    it('should calculate zero value for empty team', () => {
      const emptyTeam = createMockTeamWithPlayers([]);

      teamBuilder.draftedTeamPlayers.value = emptyTeam;

      expect(teamBuilder.teamValue.value).toBe(0);
    });

    it('should calculate total value from all selected players', () => {
      const fullTeam = createMockTeamWithPlayers([5.0, 3.5, 8.0]);

      teamBuilder.draftedTeamPlayers.value = fullTeam;
      triggerWatchEffects();

      expect(teamBuilder.teamValue.value).toBe(16.5);
    });

    it('should ignore null players in value calculation', () => {
      const partialTeam = createMockTeamWithPlayers([5.0, 3.5]);

      teamBuilder.draftedTeamPlayers.value = partialTeam;
      triggerWatchEffects();

      expect(teamBuilder.teamValue.value).toBe(8.5);
    });
  });

  describe('Remaining budget calculation', () => {
    it('should calculate remaining budget correctly for team under budget', () => {
      const teamWithNoTransfers = createMockTeamInsertData({ allowed_transfers: false });
      const underBudgetPlayers = createMockTeamWithPlayers([5.0, 3.0, 2.0]);

      teamBuilder.draftedTeamData.value = teamWithNoTransfers;
      teamBuilder.draftedTeamPlayers.value = underBudgetPlayers;
      triggerWatchEffects();

      expect(teamBuilder.remainingBudget.value).toBe(80);
    });

    it('should calculate negative remaining budget for team over budget', () => {
      const teamWithTransfers = createMockTeamInsertData({ allowed_transfers: true });
      const expensivePlayers = createMockTeamWithPlayers([10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0]);

      teamBuilder.draftedTeamData.value = teamWithTransfers;
      teamBuilder.draftedTeamPlayers.value = expensivePlayers;
      triggerWatchEffects();

      expect(teamBuilder.remainingBudget.value).toBe(-5);
    });
  });

  describe('Over-budget detection', () => {
    it('should not be over budget when remaining budget is positive', () => {
      const teamWithNoTransfers = createMockTeamInsertData({ allowed_transfers: false });
      const affordablePlayers = createMockTeamWithPlayers([5.0, 5.0, 5.0]);

      teamBuilder.draftedTeamData.value = teamWithNoTransfers;
      teamBuilder.draftedTeamPlayers.value = affordablePlayers;

      expect(teamBuilder.isOverBudget.value).toBe(false);
    });

    it('should not be over budget when remaining budget is exactly zero', () => {
      const teamWithNoTransfers = createMockTeamInsertData({ allowed_transfers: false });
      const exactBudgetPlayers = createMockTeamWithPlayers([10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0]);

      teamBuilder.draftedTeamData.value = teamWithNoTransfers;
      teamBuilder.draftedTeamPlayers.value = exactBudgetPlayers;

      expect(teamBuilder.isOverBudget.value).toBe(false);
    });

    it('should be over budget when remaining budget is negative', () => {
      const teamWithTransfers = createMockTeamInsertData({ allowed_transfers: true });
      const overBudgetPlayers = createMockTeamWithPlayers([10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0]);

      teamBuilder.draftedTeamData.value = teamWithTransfers;
      teamBuilder.draftedTeamPlayers.value = overBudgetPlayers;
      triggerWatchEffects();

      expect(teamBuilder.isOverBudget.value).toBe(true);
    });
  });
});
