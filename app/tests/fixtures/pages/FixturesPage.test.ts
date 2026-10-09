import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import { defineComponent, reactive, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FixturesPage from '~/pages/fixtures/index.vue';
import type { Fixture } from '~/types/Fixture';
import { useLeagueDataChanges } from '~/composables/useLeagueDataChanges';
import { createMockDraftedTeam } from '~/tests/factories';

const mocks = vi.hoisted(() => ({
  getCurrentGameweek: vi.fn().mockResolvedValue(4),
  fetchFixtures: vi.fn(),
  fetchTeams: vi.fn().mockResolvedValue([]),
  push: vi.fn().mockResolvedValue(undefined),
  from: vi.fn(),
}));
const fixture: Fixture = {
  id: 1,
  game_week: 4,
  home_team: { id: 1, name: 'Home', short_name: 'HOM' },
  away_team: { id: 2, name: 'Away', short_name: 'AWY' },
  home_team_score: 1,
  away_team_score: 0,
  populated_by: 'populator',
  populated_at: '2026-10-01T12:00:00Z',
};
const store = reactive({
  fixtures: [] as Fixture[],
  selectedGameweek: 4,
  fetchFixtures: mocks.fetchFixtures,
  checkWeekVerificationStatus: (week: number) => store.fixtures.length > 0
    && store.fixtures.every(f => f.game_week === week && f.verified_by && f.verified_at),
});
mockNuxtImport('useRoute', () => () => ({ query: { week: '4' } }));
mockNuxtImport('useRouter', () => () => ({
  push: mocks.push, afterEach: vi.fn(), beforeEach: vi.fn(),
  beforeResolve: vi.fn(), onError: vi.fn(),
}));
mockNuxtImport('useSupabaseClient', () => () => ({ from: mocks.from }));
vi.mock('@nuxt/ui/composables', () => ({ useToast: () => ({ add: vi.fn() }) }));
vi.mock('~/stores/fixtures', () => ({ useFixtureStore: () => store }));
vi.mock('~/stores/draftedTeams', () => ({
  useDraftedTeamsStore: () => ({ fetchDraftedTeamsWithPlayerPointsByGameweek: mocks.fetchTeams }),
}));
vi.mock('~/composables/useAppSettings', () => ({
  useAppSettings: () => ({ getCurrentGameweek: mocks.getCurrentGameweek }),
}));

describe('cached fixture list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentGameweek.mockReset().mockResolvedValue(4);
    mocks.fetchTeams.mockReset().mockResolvedValue([]);
    store.fixtures = [];
  });

  const mountPointsPage = () => shallowMount(FixturesPage, {
    global: {
      stubs: {
        DraftedTeamWithPoints: defineComponent({
          props: ['draftedTeam'], template: '<div data-points>{{ draftedTeam.team_name }}</div>',
        }),
      },
    },
  });

  it('enables week selection only after initial settings and points have loaded', async () => {
    let finishSettings!: (week: number) => void;
    mocks.getCurrentGameweek.mockImplementationOnce(() => new Promise((resolve) => {
      finishSettings = resolve;
    }));
    mocks.fetchFixtures.mockImplementation(async (week: number) => {
      store.fixtures = [{ ...fixture, game_week: week }];
    });
    let finishPoints!: (teams: ReturnType<typeof createMockDraftedTeam>[]) => void;
    mocks.fetchTeams.mockImplementation(async (week: number) => [
      createMockDraftedTeam({ team_name: `Week ${week} totals` }),
    ]);
    mocks.fetchTeams.mockImplementationOnce(() => new Promise((resolve) => {
      finishPoints = resolve;
    }));
    const wrapper = mountPointsPage();
    try {
      const selector = wrapper.findComponent({ name: 'USelectMenu' });
      expect(selector.props('disabled')).toBe(true);

      finishSettings(4);
      await flushPromises();
      expect(selector.props('disabled')).toBe(true);

      finishPoints([createMockDraftedTeam({ team_name: 'Week 4 totals' })]);
      await flushPromises();
      expect(selector.props('disabled')).toBe(false);
      selector.vm.$emit('update:modelValue', 5);
      await flushPromises();

      expect(selector.props('modelValue')).toBe(5);
      expect(store.fixtures[0]?.game_week).toBe(5);
      expect(store.selectedGameweek).toBe(5);
      expect(wrapper.find('[data-points]').text()).toBe('Week 5 totals');
      expect(mocks.push).toHaveBeenLastCalledWith({ path: 'fixtures', query: { week: 5 } });
    }
    finally {
      wrapper.unmount();
    }
  });

  it('catches up with a fixture save during the initial points load', async () => {
    mocks.fetchFixtures.mockImplementation(async () => {
      store.fixtures = [{ ...fixture }];
    });
    let finishInitial!: (teams: ReturnType<typeof createMockDraftedTeam>[]) => void;
    mocks.fetchTeams.mockImplementationOnce(() => new Promise((resolve) => {
      finishInitial = resolve;
    }));
    mocks.fetchTeams.mockResolvedValueOnce([createMockDraftedTeam({ team_name: 'Latest totals' })]);
    const wrapper = mountPointsPage();
    await flushPromises();

    useLeagueDataChanges().notifyPlayerStatisticsChanged();
    await flushPromises();
    finishInitial([createMockDraftedTeam({ team_name: 'Old totals' })]);
    await flushPromises();

    expect(wrapper.find('[data-points]').text()).toBe('Latest totals');
    wrapper.unmount();
  });

  it('keeps saved points when a week-change request finishes later', async () => {
    mocks.fetchFixtures.mockImplementation(async () => {
      store.fixtures = [{ ...fixture }];
    });
    const wrapper = mountPointsPage();
    await flushPromises();
    let finishWeekChange!: (teams: ReturnType<typeof createMockDraftedTeam>[]) => void;
    mocks.fetchTeams.mockImplementationOnce(() => new Promise((resolve) => {
      finishWeekChange = resolve;
    }));
    wrapper.findComponent({ name: 'USelectMenu' }).vm.$emit('update:modelValue', 5);
    await flushPromises();
    mocks.fetchTeams.mockResolvedValueOnce([createMockDraftedTeam({ team_name: 'Latest totals' })]);

    useLeagueDataChanges().notifyPlayerStatisticsChanged();
    await flushPromises();
    finishWeekChange([createMockDraftedTeam({ team_name: 'Old totals' })]);
    await flushPromises();

    expect(wrapper.find('[data-points]').text()).toBe('Latest totals');
    wrapper.unmount();
  });

  it('shows shared verification changes without fetching again on navigation', async () => {
    mocks.fetchFixtures.mockImplementation(async () => {
      store.fixtures = [{ ...fixture }];
    });
    const visible = ref(true);
    const wrapper = mount(defineComponent({
      components: { FixturesPage },
      setup: () => ({ visible }),
      template: '<KeepAlive><FixturesPage v-if="visible" /></KeepAlive>',
    }), {
      global: {
        stubs: {
          NuxtLink: true, USelectMenu: true, UBadge: true, UTooltip: true,
          Icon: true, FixtureBase: true, SkeletonFixture: true,
          DraftedTeamWithPoints: true, SkeletonDraftedTeam: true,
          UAlert: defineComponent({ template: '<div><slot name="description" /></div>' }),
          UButton: defineComponent({ props: ['label', 'disabled'], template: '<button :disabled="disabled">{{ label }}</button>' }),
        },
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('1 fixture needs verification');
    expect(mocks.fetchFixtures).toHaveBeenCalledOnce();
    expect(mocks.fetchTeams).toHaveBeenCalledOnce();

    visible.value = false;
    await flushPromises();
    store.fixtures = [{ ...fixture, verified_by: 'verifier', verified_at: '2026-10-02T12:00:00Z' }];
    visible.value = true;
    await flushPromises();

    expect(wrapper.text()).toContain('All fixtures for this week have been verified');
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
    expect(mocks.fetchFixtures).toHaveBeenCalledOnce();
    expect(mocks.fetchTeams).toHaveBeenCalledOnce();
    useLeagueDataChanges().notifyPlayerStatisticsChanged();
    await flushPromises();
    expect(mocks.fetchFixtures).toHaveBeenCalledOnce();
    expect(mocks.fetchTeams).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('All fixtures for this week have been verified');

    mocks.from.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ error: null }),
    });
    const { weeklyStatisticsRevision } = useLeagueDataChanges();
    const beforeSave = weeklyStatisticsRevision.value;
    await wrapper.find('button').trigger('click');
    await flushPromises();
    expect(weeklyStatisticsRevision.value).toBe(beforeSave + 1);
    expect(mocks.fetchFixtures).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
