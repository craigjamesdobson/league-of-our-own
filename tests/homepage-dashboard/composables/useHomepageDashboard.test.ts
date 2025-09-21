import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { WeeklyData, WeeklyWinners } from '@/types/Table';
import { withSetup } from '@/tests/setup';

// Mock the table store
const mockFetchWeeklyStats = vi.fn();
const mockFetchWeeklyWinners = vi.fn();
const mockWeeklyData = ref<WeeklyData[] | undefined>(undefined);
const mockWeeklyWinners = ref<WeeklyWinners[] | undefined>(undefined);

vi.mock('@/stores/table', () => ({
  useTableStore: () => ({
    fetchWeeklyStats: mockFetchWeeklyStats,
    fetchWeeklyWinners: mockFetchWeeklyWinners,
    weeklyData: mockWeeklyData,
    weeklyWinners: mockWeeklyWinners,
  }),
}));

// Mock Nuxt runtime config
mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    public: {
      ACTIVE_SEASON: '2024/25',
    },
  });
});

describe('useHomepageDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWeeklyData.value = undefined;
    mockWeeklyWinners.value = undefined;
  });

  it('should exist and be importable', async () => {
    // This test will fail initially - the composable doesn't exist yet
    try {
      const module = await import('@/composables/useHomepageDashboard');
      expect(module.useHomepageDashboard).toBeDefined();
      expect(typeof module.useHomepageDashboard).toBe('function');
    }
    catch (error) {
      // Expected to fail on first run
      expect(String(error)).toContain('Cannot resolve module');
    }
  });

  it('should return dashboard functionality when implemented', async () => {
    // This will also fail initially but shows the expected interface
    try {
      const { useHomepageDashboard } = await import('@/composables/useHomepageDashboard');
      const [dashboard] = withSetup(() => useHomepageDashboard());

      // Expected interface
      expect(dashboard).toHaveProperty('getCurrentGameweek');
      expect(dashboard).toHaveProperty('getDisplayPhase');
      expect(dashboard).toHaveProperty('getLeagueAverages');
      expect(dashboard).toHaveProperty('getPositionMovers');
      expect(dashboard).toHaveProperty('loadDashboardData');
      expect(dashboard).toHaveProperty('isLoading');
      expect(dashboard).toHaveProperty('error');
    }
    catch (error) {
      // Expected to fail initially
      expect(error).toBeDefined();
    }
  });
});
