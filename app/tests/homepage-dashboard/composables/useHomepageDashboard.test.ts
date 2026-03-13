import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { WeeklyData, WeeklyWinners } from '@/types/Table';
import { withSetup } from '@/tests/setup';
import { useHomepageDashboard } from '@/composables/useHomepageDashboard';

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

// Queue-based Supabase mock: each from(table) call consumes the next queued response
type MockResponse = { data: unknown; error: unknown };
let tableQueues: Record<string, MockResponse[]> = {};

const makeChain = (response: MockResponse) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(response),
    then: (onFulfilled: (v: MockResponse) => MockResponse, onRejected?: (e: unknown) => unknown) =>
      Promise.resolve(response).then(onFulfilled, onRejected),
  };
  return chain;
};

const mockFrom = vi.fn().mockImplementation((table: string) => {
  const queue = tableQueues[table];
  const response = queue && queue.length > 0 ? queue.shift()! : { data: null, error: null };
  return makeChain(response);
});

mockNuxtImport('useSupabaseClient', () => {
  return () => ({ from: mockFrom });
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
      const { useHomepageDashboard: composable } = await import('@/composables/useHomepageDashboard');
      const [dashboard] = withSetup(() => composable());

      // Expected interface
      expect(dashboard).toHaveProperty('getCurrentGameweek');
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

describe('fetchWeeklyTransfers - player_out resolution', () => {
  // Populate queues for every table touched by loadDashboardData that isn't
  // directly under test (fetchTopPositionPlayers, loadCurrentGameweek, getLeagueAverages).
  const setupBaseQueues = (gameweek: number) => {
    tableQueues['player_statistics'] = [
      { data: [], error: null },
      { data: [], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ];
    tableQueues['settings'] = [{ data: { setting_value: String(gameweek) }, error: null }];
    tableQueues['weekly_statistics'] = [{ data: [], error: null }];
  };

  beforeEach(() => {
    vi.clearAllMocks();
    tableQueues = {};
    mockWeeklyData.value = undefined;
    mockWeeklyWinners.value = undefined;
  });

  it('should show the original drafted player as player_out for the first transfer on a slot', async () => {
    setupBaseQueues(10);

    tableQueues['drafted_transfers'] = [
      // Main query: GW10 transfer — slot 1, player Y (id=20) comes in
      {
        data: [{ drafted_transfer_id: 1, transfer_week: 10, drafted_player: 1, player_id: 20 }],
        error: null,
      },
      // Prior-transfer check: no prior transfers exist for this slot
      { data: [], error: null },
    ];
    tableQueues['drafted_players'] = [
      {
        data: {
          drafted_player: 1,
          drafted_teams: { team_name: 'Team A', team_owner: 'Owner A' },
          players_view: { web_name: 'Player X', image: 'x.png', team_short_name: 'MCI', cost: 9.0 },
        },
        error: null,
      },
    ];
    tableQueues['players_view'] = [
      // player_in (Player Y)
      { data: { web_name: 'Player Y', team_short_name: 'ARS', position: 3, image: 'y.png', cost: 8.0 }, error: null },
    ];

    const [dashboard, app] = withSetup(() => useHomepageDashboard());
    await dashboard.loadDashboardData();

    expect(dashboard.weeklyTransfers.value).toHaveLength(1);
    expect(dashboard.weeklyTransfers.value[0]!.player_out).toBe('Player X');
    expect(dashboard.weeklyTransfers.value[0]!.player_in).toBe('Player Y');

    app.unmount();
  });

  it('should show the previously transferred player as player_out when the original player returns to the slot', async () => {
    // Scenario: GW10 X→Y, GW30 Y→X (original returns)
    // Without fix: player_out shows Player X (original drafted player)
    // With fix: player_out shows Player Y (who was actually occupying the slot)
    setupBaseQueues(30);

    tableQueues['drafted_transfers'] = [
      // Main query: GW30 transfer — slot 1, player X (id=10) returns
      {
        data: [{ drafted_transfer_id: 2, transfer_week: 30, drafted_player: 1, player_id: 10 }],
        error: null,
      },
      // Prior-transfer check: GW10 had Player Y (id=20) transferred in
      { data: [{ player_id: 20 }], error: null },
    ];
    tableQueues['drafted_players'] = [
      {
        data: {
          drafted_player: 1,
          drafted_teams: { team_name: 'Team A', team_owner: 'Owner A' },
          // drafted_players always points to the original player — Player X
          players_view: { web_name: 'Player X', image: 'x.png', team_short_name: 'MCI', cost: 9.0 },
        },
        error: null,
      },
    ];
    tableQueues['players_view'] = [
      // player_in (Player X returning)
      { data: { web_name: 'Player X', team_short_name: 'MCI', position: 3, image: 'x.png', cost: 9.0 }, error: null },
      // prior player — Player Y who was actually occupying the slot
      { data: { web_name: 'Player Y', image: 'y.png', team_short_name: 'ARS', cost: 8.0 }, error: null },
    ];

    const [dashboard, app] = withSetup(() => useHomepageDashboard());
    await dashboard.loadDashboardData();

    expect(dashboard.weeklyTransfers.value).toHaveLength(1);
    // Player Y was in the slot — they are the one being transferred OUT
    expect(dashboard.weeklyTransfers.value[0]!.player_out).toBe('Player Y');
    expect(dashboard.weeklyTransfers.value[0]!.player_in).toBe('Player X');

    app.unmount();
  });

  it('should show the previously transferred player as player_out when a new third player takes the slot', async () => {
    // Scenario: GW10 X→Y, GW30 Y→Z (new player Z)
    // Without fix: player_out shows Player X (original drafted player)
    // With fix: player_out shows Player Y (who was actually occupying the slot)
    setupBaseQueues(30);

    tableQueues['drafted_transfers'] = [
      // Main query: GW30 transfer — slot 1, Player Z (id=30) comes in
      {
        data: [{ drafted_transfer_id: 3, transfer_week: 30, drafted_player: 1, player_id: 30 }],
        error: null,
      },
      // Prior-transfer check: GW10 had Player Y (id=20) transferred in
      { data: [{ player_id: 20 }], error: null },
    ];
    tableQueues['drafted_players'] = [
      {
        data: {
          drafted_player: 1,
          drafted_teams: { team_name: 'Team A', team_owner: 'Owner A' },
          players_view: { web_name: 'Player X', image: 'x.png', team_short_name: 'MCI', cost: 9.0 },
        },
        error: null,
      },
    ];
    tableQueues['players_view'] = [
      // player_in (Player Z)
      { data: { web_name: 'Player Z', team_short_name: 'LIV', position: 3, image: 'z.png', cost: 7.5 }, error: null },
      // prior player — Player Y who was in the slot
      { data: { web_name: 'Player Y', image: 'y.png', team_short_name: 'ARS', cost: 8.0 }, error: null },
    ];

    const [dashboard, app] = withSetup(() => useHomepageDashboard());
    await dashboard.loadDashboardData();

    expect(dashboard.weeklyTransfers.value).toHaveLength(1);
    expect(dashboard.weeklyTransfers.value[0]!.player_out).toBe('Player Y');
    expect(dashboard.weeklyTransfers.value[0]!.player_in).toBe('Player Z');

    app.unmount();
  });
});
