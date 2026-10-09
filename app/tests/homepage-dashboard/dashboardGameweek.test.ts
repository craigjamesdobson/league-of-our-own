import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import DashboardPage from '@/pages/index.vue';
import TopPerformers from '@/components/Dashboard/TopPerformers.vue';
import PositionMovers from '@/components/Dashboard/PositionMovers.vue';
import { useTableStore } from '@/stores/table';
import { useAppSettings } from '@/composables/useAppSettings';
import { useLeagueDataChanges } from '~/composables/useLeagueDataChanges';
import type { WeeklyData } from '@/types/Table';

const { mockRpc, mockTransferWeek, state } = vi.hoisted(() => ({
  mockRpc: vi.fn(), mockTransferWeek: vi.fn(), state: { currentGameweek: 4 },
}));

vi.mock('@/stores/account', () => ({
  useAccountStore: () => ({ userIsLoggedIn: true }),
}));

mockNuxtImport('useSupabaseClient', () => () => ({
  rpc: mockRpc,
  from: (table: string) => {
    const response = {
      data: table === 'settings'
        ? [
            { setting_key: 'active_season', setting_value: '26-27' },
            { setting_key: 'current_gameweek', setting_value: String(state.currentGameweek) },
            { setting_key: 'season_complete', setting_value: 'false' },
            { setting_key: 'site_open', setting_value: 'true' },
            { setting_key: 'league_data_public', setting_value: 'true' },
            { setting_key: 'team_registration_open', setting_value: 'false' },
            { setting_key: 'team_submission_deadline', setting_value: '2026-08-20' },
          ]
        : [],
      error: null,
    };
    return {
      select() { return this; },
      in() { return Promise.resolve(response); },
      eq(_column: string, value: number) {
        if (table === 'drafted_transfers') mockTransferWeek(value);
        return Promise.resolve(response);
      },
      order() { return Promise.resolve(response); },
    };
  },
}));

const team = (weekPoints: number): WeeklyData => ({
  drafted_team_id: 1,
  team_name: 'Test team',
  team_owner: 'Test owner',
  goals: 0,
  assists: 0,
  clean_sheets: 0,
  red_cards: 0,
  total_points: 100,
  week_points: weekPoints,
  weekly_winner: weekPoints > 0,
  prev_week_position: 4,
});

describe('dashboard gameweek after visiting the table', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    state.currentGameweek = 4;
    setActivePinia(createPinia());
    await useAppSettings().refreshAppSettings();
  });

  const mountDashboard = () => shallowMount(DashboardPage, {
    global: { stubs: { Icon: true, UButton: true } },
  });

  it('updates saved results in the cached dashboard without fetching on navigation', async () => {
    let savedPoints = 0;
    mockRpc.mockImplementation(async (name: string) => ({
      data: name === 'get_weekly_stats_for_gameweek' ? [team(savedPoints)] : [],
      error: null,
    }));
    const visible = ref(true);
    const wrapper = mount(defineComponent({
      components: { DashboardPage },
      setup: () => ({ visible }),
      template: '<KeepAlive><DashboardPage v-if="visible" /></KeepAlive>',
    }), {
      global: {
        stubs: {
          TopPerformers: true, PositionMovers: true, WeeklyStats: true,
          WeeklyTransfers: true, TopPerformingPlayers: true, WelcomeBack: true,
          Icon: true, UButton: true,
        },
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('In progress');
    expect(mockRpc.mock.calls.filter(([name]) => name === 'get_weekly_stats_for_gameweek')).toHaveLength(1);

    visible.value = false;
    await flushPromises();
    savedPoints = 25;
    useLeagueDataChanges().notifyWeeklyStatisticsChanged();
    await flushPromises();
    const requestsAfterSave = mockRpc.mock.calls.length;
    visible.value = true;
    await flushPromises();

    expect(wrapper.text()).toContain('Results available');
    expect(wrapper.findComponent(TopPerformers).props('weeklyData')).toEqual([team(25)]);
    expect(mockRpc).toHaveBeenCalledTimes(requestsAfterSave);
    expect(mockRpc.mock.calls.filter(([name]) => name === 'get_weekly_stats_for_gameweek')).toHaveLength(2);
    wrapper.unmount();
  });

  it('keeps cards visible while saved weekly totals are being fetched', async () => {
    mockRpc.mockImplementation(async (name: string) => ({
      data: name === 'get_weekly_stats_for_gameweek' ? [team(10)] : [],
      error: null,
    }));
    const wrapper = mountDashboard();
    await flushPromises();
    let finishUpdate!: (value: { data: WeeklyData[]; error: null }) => void;
    mockRpc.mockImplementation((name: string) => name === 'get_weekly_stats_for_gameweek'
      ? new Promise((resolve) => { finishUpdate = resolve; })
      : Promise.resolve({ data: [], error: null }));

    useLeagueDataChanges().notifyWeeklyStatisticsChanged();
    await flushPromises();

    expect(wrapper.text()).not.toContain('Loading Gameweek Data');
    expect(wrapper.findComponent(TopPerformers).props('weeklyData')).toEqual([team(10)]);
    expect(finishUpdate).toBeDefined();
    finishUpdate({ data: [team(25)], error: null });
    await flushPromises();
    expect(wrapper.findComponent(TopPerformers).props('weeklyData')).toEqual([team(25)]);
    wrapper.unmount();
  });

  it('keeps the latest saved totals when an older update finishes last', async () => {
    mockRpc.mockImplementation(async (name: string) => ({
      data: name === 'get_weekly_stats_for_gameweek' ? [team(10)] : [],
      error: null,
    }));
    const wrapper = mountDashboard();
    await flushPromises();
    const pending: Array<(value: { data: WeeklyData[]; error: null }) => void> = [];
    mockRpc.mockImplementation((name: string) => name === 'get_weekly_stats_for_gameweek'
      ? new Promise((resolve) => { pending.push(resolve); })
      : Promise.resolve({ data: [], error: null }));

    useLeagueDataChanges().notifyWeeklyStatisticsChanged();
    await flushPromises();
    useLeagueDataChanges().notifyWeeklyStatisticsChanged();
    await flushPromises();
    expect(pending).toHaveLength(2);

    pending[1]!({ data: [team(30)], error: null });
    await flushPromises();
    pending[0]!({ data: [team(20)], error: null });
    await flushPromises();

    expect(wrapper.findComponent(TopPerformers).props('weeklyData')).toEqual([team(30)]);
    wrapper.unmount();
  });

  it('loads matching transfers when a saved result advances the dashboard week', async () => {
    mockRpc.mockImplementation(async (name: string) => ({
      data: name === 'get_weekly_stats_for_gameweek' ? [team(10)] : [],
      error: null,
    }));
    const wrapper = mountDashboard();
    await flushPromises();
    expect(mockTransferWeek).toHaveBeenLastCalledWith(4);

    state.currentGameweek = 5;
    useLeagueDataChanges().notifyWeeklyStatisticsChanged();
    await flushPromises();

    expect(wrapper.text()).toContain('Gameweek 5 Summary');
    expect(mockTransferWeek).toHaveBeenLastCalledWith(5);
    wrapper.unmount();
  });

  it('does not show cached table results while loading the current gameweek', async () => {
    mockRpc.mockImplementation(async (name: string, args?: { target_week: number }) => ({
      data: name === 'get_weekly_stats_for_gameweek' ? [team(args?.target_week === 3 ? 30 : 0)] : [],
      error: null,
    }));
    const table = useTableStore();
    await table.fetchWeeklyStats(3);

    const wrapper = mountDashboard();

    expect(wrapper.text()).not.toContain('Results available');
    await flushPromises();
    expect(wrapper.text()).toContain('Gameweek 4 Summary');
    expect(wrapper.text()).toContain('In progress');
    expect(wrapper.findComponent(TopPerformers).props('weeklyData')).toEqual([team(0)]);
    expect(wrapper.findComponent(PositionMovers).props('hasResults')).toBe(false);
    expect(mockRpc).toHaveBeenCalledWith('get_weekly_stats_for_gameweek', {
      target_week: 4,
      active_season_param: '26-27',
    });
    expect(table.weeklyData).toEqual([team(30)]);
    wrapper.unmount();
  });

  it.each([0, 20])('keeps current-week status and cards when a table request completes later (points: %s)', async (currentPoints) => {
    let finishTableRequest!: (value: { data: WeeklyData[]; error: null }) => void;
    mockRpc.mockImplementation((name: string, args?: { target_week: number }) => {
      if (name === 'get_weekly_stats_for_gameweek' && args?.target_week === 3) {
        return new Promise((resolve) => {
          finishTableRequest = resolve;
        });
      }
      return Promise.resolve({
        data: name === 'get_weekly_stats_for_gameweek' ? [team(currentPoints)] : [],
        error: null,
      });
    });
    const table = useTableStore();
    const tableRequest = table.fetchWeeklyStats(3);
    await flushPromises();

    const wrapper = mountDashboard();
    await flushPromises();
    finishTableRequest({ data: [team(30)], error: null });
    await tableRequest;
    await flushPromises();

    expect(wrapper.text()).toContain('Gameweek 4 Summary');
    expect(wrapper.findComponent(TopPerformers).props('weeklyData')).toEqual([team(currentPoints)]);
    expect(wrapper.findComponent(TopPerformers).props('hasResults')).toBe(currentPoints > 0);
    expect(wrapper.findComponent(PositionMovers).props('hasResults')).toBe(currentPoints > 0);
    expect(wrapper.findComponent(PositionMovers).props('positionMovers')?.biggestRisers[0]?.week_points).toBe(currentPoints);
    if (currentPoints === 0) {
      expect(wrapper.text()).not.toContain('Results available');
      expect(wrapper.text()).toContain('In progress');
    }
    else {
      expect(wrapper.text()).toContain('Results available');
    }
    wrapper.unmount();
  });

  it('keeps the cached dashboard in progress after selecting a completed week in the table', async () => {
    mockRpc.mockImplementation(async (name: string, args?: { target_week: number }) => ({
      data: name === 'get_weekly_stats_for_gameweek' ? [team(args?.target_week === 3 ? 30 : 0)] : [],
      error: null,
    }));
    const wrapper = mountDashboard();
    await flushPromises();

    // NuxtPage keeps the dashboard mounted while the table loads its selected week.
    await useTableStore().fetchWeeklyStats(3);
    await flushPromises();

    expect(wrapper.text()).toContain('Gameweek 4 Summary');
    expect(wrapper.text()).toContain('In progress');
    expect(wrapper.text()).not.toContain('Results available');
    expect(wrapper.findComponent(TopPerformers).props('weeklyData')).toEqual([team(0)]);
    expect(wrapper.findComponent(PositionMovers).props('hasResults')).toBe(false);
    expect(wrapper.findComponent(PositionMovers).props('positionMovers')?.biggestRisers[0]?.week_points).toBe(0);
    wrapper.unmount();
  });
});
