import { afterEach, describe, it, expect, vi } from 'vitest';
import { nextTick } from 'vue';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import {
  createMockTeamInsertData,
  createMockTeamTableData,
  createMockTeamWithPlayers,
} from '@/tests/factories';
import { useTeamBuilder } from '@/composables/useTeamBuilder';
import { withSetup } from '@/tests/setup';

// Mock Nuxt composables used by useTeamBuilder
mockNuxtImport('useSupabaseClient', () => {
  return () => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockReturnValue({
            data: null,
            error: null,
          }),
        }),
      }),
    }),
  });
});

mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    app: { baseURL: '/' },
    public: {},
  });
});

vi.mock('@nuxt/ui/composables', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}));

vi.mock('@/utils/utility', () => ({
  delay: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useTeamBuilder - Budget Calculations', () => {
  describe('Budget allocation based on transfer allowance', () => {
    it('should set budget to 90 when transfers are not allowed', () => {
      const [teamBuilder, app] = withSetup(() => useTeamBuilder());
      const teamWithNoTransfers = createMockTeamInsertData({
        allowed_transfers: false,
      });

      teamBuilder.draftedTeamData.value = teamWithNoTransfers;

      expect(teamBuilder.teamBudget.value).toBe(90);

      app.unmount();
    });

    it('should set budget to 85 when transfers are allowed', () => {
      const [teamBuilder, app] = withSetup(() => useTeamBuilder());
      const teamWithTransfers = createMockTeamInsertData({
        allowed_transfers: true,
      });

      teamBuilder.draftedTeamData.value = teamWithTransfers;

      expect(teamBuilder.teamBudget.value).toBe(85);

      app.unmount();
    });
  });

  describe('Team value calculation from selected players', () => {
    it('should calculate zero value for empty team', () => {
      const [teamBuilder, app] = withSetup(() => useTeamBuilder());

      expect(teamBuilder.teamValue.value).toBe(0);

      app.unmount();
    });

    it('should calculate total value from all selected players', async () => {
      const [teamBuilder, app] = withSetup(() => useTeamBuilder());
      const fullTeam = createMockTeamWithPlayers([5.0, 3.5, 8.0]);

      teamBuilder.draftedTeamPlayers.value = fullTeam;
      await nextTick();

      expect(teamBuilder.teamValue.value).toBe(16.5);

      app.unmount();
    });

    it('should ignore null players in value calculation', async () => {
      const [teamBuilder, app] = withSetup(() => useTeamBuilder());
      const partialTeam = createMockTeamWithPlayers([5.0, 3.5]);

      teamBuilder.draftedTeamPlayers.value = partialTeam;
      await nextTick();

      expect(teamBuilder.teamValue.value).toBe(8.5);

      app.unmount();
    });
  });

  describe('Remaining budget calculation', () => {
    it('should calculate remaining budget correctly for team under budget', async () => {
      const [teamBuilder, app] = withSetup(() => useTeamBuilder());
      const teamWithNoTransfers = createMockTeamInsertData({ allowed_transfers: false });
      const underBudgetPlayers = createMockTeamWithPlayers([5.0, 3.0, 2.0]);

      teamBuilder.draftedTeamData.value = teamWithNoTransfers;
      teamBuilder.draftedTeamPlayers.value = underBudgetPlayers;
      await nextTick();

      expect(teamBuilder.remainingBudget.value).toBe(80);

      app.unmount();
    });

    it('should calculate negative remaining budget for team over budget', async () => {
      const [teamBuilder, app] = withSetup(() => useTeamBuilder());
      const teamWithTransfers = createMockTeamInsertData({ allowed_transfers: true });
      const expensivePlayers = createMockTeamWithPlayers([10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0]);

      teamBuilder.draftedTeamData.value = teamWithTransfers;
      teamBuilder.draftedTeamPlayers.value = expensivePlayers;
      await nextTick();

      expect(teamBuilder.remainingBudget.value).toBe(-5);

      app.unmount();
    });
  });

  describe('Over-budget detection', () => {
    it('should not be over budget when remaining budget is positive', () => {
      const [teamBuilder, app] = withSetup(() => useTeamBuilder());
      const teamWithNoTransfers = createMockTeamInsertData({ allowed_transfers: false });
      const affordablePlayers = createMockTeamWithPlayers([5.0, 5.0, 5.0]);

      teamBuilder.draftedTeamData.value = teamWithNoTransfers;
      teamBuilder.draftedTeamPlayers.value = affordablePlayers;

      expect(teamBuilder.isOverBudget.value).toBe(false);

      app.unmount();
    });

    it('should not be over budget when remaining budget is exactly zero', () => {
      const [teamBuilder, app] = withSetup(() => useTeamBuilder());
      const teamWithNoTransfers = createMockTeamInsertData({ allowed_transfers: false });
      const exactBudgetPlayers = createMockTeamWithPlayers([10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0]);

      teamBuilder.draftedTeamData.value = teamWithNoTransfers;
      teamBuilder.draftedTeamPlayers.value = exactBudgetPlayers;

      expect(teamBuilder.isOverBudget.value).toBe(false);

      app.unmount();
    });

    it('should be over budget when remaining budget is negative', async () => {
      const [teamBuilder, app] = withSetup(() => useTeamBuilder());
      const teamWithTransfers = createMockTeamInsertData({ allowed_transfers: true });
      const overBudgetPlayers = createMockTeamWithPlayers([10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0]);

      teamBuilder.draftedTeamData.value = teamWithTransfers;
      teamBuilder.draftedTeamPlayers.value = overBudgetPlayers;
      await nextTick();

      expect(teamBuilder.isOverBudget.value).toBe(true);

      app.unmount();
    });
  });

  describe('Submission confirmation', () => {
    it('keeps a saved-with-email-failure state when confirmation delivery fails', async () => {
      const savedTeam = createMockTeamTableData({
        key: '4bd08b04-a810-4faf-b368-0770360477f9',
        total_team_value: 55,
      });
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({
          outcome: 'created',
          team: savedTeam,
          emailSent: false,
        })
        .mockResolvedValueOnce({
          ...savedTeam,
          players: [],
        });
      vi.stubGlobal('$fetch', fetchMock);

      const [teamBuilder, app] = withSetup(() => useTeamBuilder());
      teamBuilder.draftedTeamData.value = createMockTeamInsertData();
      teamBuilder.draftedTeamPlayers.value = createMockTeamWithPlayers(Array.from({ length: 11 }, () => 5));
      teamBuilder.turnstileToken.value = 'valid-token';

      await teamBuilder.submitTeam();

      expect(teamBuilder.saveConfirmation.value).toBe('submitted-email-failed');
      app.unmount();
    });
  });
});
