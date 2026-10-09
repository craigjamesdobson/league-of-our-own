import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { flushPromises, shallowMount } from '@vue/test-utils';
import DashboardPage from '@/pages/index.vue';
import TopPerformers from '@/components/Dashboard/TopPerformers.vue';
import PositionMovers from '@/components/Dashboard/PositionMovers.vue';
import { useTableStore } from '@/stores/table';
import { useAppSettings } from '@/composables/useAppSettings';
import type { WeeklyData } from '@/types/Table';

const { mockRpc } = vi.hoisted(() => ({ mockRpc: vi.fn() }));

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
            { setting_key: 'current_gameweek', setting_value: '4' },
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
      eq() { return Promise.resolve(response); },
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
    setActivePinia(createPinia());
    await useAppSettings().refreshAppSettings();
  });

  const mountDashboard = () => shallowMount(DashboardPage, {
    global: { stubs: { Icon: true, UButton: true } },
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
