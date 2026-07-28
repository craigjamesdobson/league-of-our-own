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
    app: {
      baseURL: '/',
    },
    public: {},
  });
});

// Queue-based Supabase mock: each from(table) call consumes the next queued response
type MockResponse = { data: unknown; error: unknown };
let tableQueues: Record<string, MockResponse[]> = {};

const makeChain = (response: MockResponse) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
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

  it('should exist and be importable', () => {
    expect(useHomepageDashboard).toBeDefined();
    expect(typeof useHomepageDashboard).toBe('function');
  });

  it('should return dashboard functionality when implemented', () => {
    const [dashboard, app] = withSetup(() => useHomepageDashboard());

    expect(dashboard).toHaveProperty('getCurrentGameweek');
    expect(dashboard).toHaveProperty('getPositionMovers');
    expect(dashboard).toHaveProperty('loadDashboardData');
    expect(dashboard).toHaveProperty('isLoading');
    expect(dashboard).toHaveProperty('error');

    app.unmount();
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
    tableQueues['settings'] = [{
      data: [
        { setting_key: 'active_season', setting_value: '26-27' },
        { setting_key: 'current_gameweek', setting_value: String(gameweek) },
        { setting_key: 'season_complete', setting_value: 'false' },
        { setting_key: 'site_open', setting_value: 'true' },
        { setting_key: 'league_data_public', setting_value: 'false' },
        { setting_key: 'team_registration_open', setting_value: 'true' },
        { setting_key: 'team_submission_deadline', setting_value: '2026-08-20' },
      ],
      error: null,
    }];
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
      // Prior-transfers batch: no prior transfers for this slot
      { data: [], error: null },
    ];
    // Batch fetch: drafted_players (consumed first in Promise.all)
    tableQueues['drafted_players'] = [
      {
        data: [
          {
            drafted_player_id: 1,
            drafted_player: 1,
            drafted_teams: { team_name: 'Team A', team_owner: 'Owner A' },
            players_view: { web_name: 'Player X', image: 'x.png', team_short_name: 'MCI', cost: 9.0 },
          },
        ],
        error: null,
      },
    ];
    tableQueues['players_view'] = [
      // Batch fetch: new players (Player Y) — consumed second in Promise.all
      { data: [{ player_id: 20, web_name: 'Player Y', team_short_name: 'ARS', position: 3, image: 'y.png', cost: 8.0 }], error: null },
      // No prior players batch (priorPlayerIds is empty since no prior transfers)
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
      // Prior-transfers batch: GW10 had Player Y (id=20) transferred in
      { data: [{ drafted_player: 1, player_id: 20, transfer_week: 10 }], error: null },
    ];
    // Batch fetch: drafted_players (consumed first in Promise.all)
    tableQueues['drafted_players'] = [
      {
        data: [
          {
            drafted_player_id: 1,
            drafted_player: 1,
            drafted_teams: { team_name: 'Team A', team_owner: 'Owner A' },
            // drafted_players always points to the original player — Player X
            players_view: { web_name: 'Player X', image: 'x.png', team_short_name: 'MCI', cost: 9.0 },
          },
        ],
        error: null,
      },
    ];
    tableQueues['players_view'] = [
      // Batch fetch: new players (Player X returning) — consumed second in Promise.all
      { data: [{ player_id: 10, web_name: 'Player X', team_short_name: 'MCI', position: 3, image: 'x.png', cost: 9.0 }], error: null },
      // Batch fetch: prior players (Player Y who was in the slot)
      { data: [{ player_id: 20, web_name: 'Player Y', image: 'y.png', team_short_name: 'ARS', cost: 8.0 }], error: null },
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
      // Prior-transfers batch: GW10 had Player Y (id=20) transferred in
      { data: [{ drafted_player: 1, player_id: 20, transfer_week: 10 }], error: null },
    ];
    // Batch fetch: drafted_players (consumed first in Promise.all)
    tableQueues['drafted_players'] = [
      {
        data: [
          {
            drafted_player_id: 1,
            drafted_player: 1,
            drafted_teams: { team_name: 'Team A', team_owner: 'Owner A' },
            players_view: { web_name: 'Player X', image: 'x.png', team_short_name: 'MCI', cost: 9.0 },
          },
        ],
        error: null,
      },
    ];
    tableQueues['players_view'] = [
      // Batch fetch: new players (Player Z) — consumed second in Promise.all
      { data: [{ player_id: 30, web_name: 'Player Z', team_short_name: 'LIV', position: 3, image: 'z.png', cost: 7.5 }], error: null },
      // Batch fetch: prior players (Player Y who was in the slot)
      { data: [{ player_id: 20, web_name: 'Player Y', image: 'y.png', team_short_name: 'ARS', cost: 8.0 }], error: null },
    ];

    const [dashboard, app] = withSetup(() => useHomepageDashboard());
    await dashboard.loadDashboardData();

    expect(dashboard.weeklyTransfers.value).toHaveLength(1);
    expect(dashboard.weeklyTransfers.value[0]!.player_out).toBe('Player Y');
    expect(dashboard.weeklyTransfers.value[0]!.player_in).toBe('Player Z');

    app.unmount();
  });
});
