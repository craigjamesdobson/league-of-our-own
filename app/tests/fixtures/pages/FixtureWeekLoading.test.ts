import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { reactive } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FixturesPage from '~/pages/fixtures/index.vue';
import { createMockDraftedTeam } from '~/tests/factories';
import type { Fixture } from '~/types/Fixture';

const mocks = vi.hoisted(() => ({
  getCurrentGameweek: vi.fn(),
  fetchFixtures: vi.fn(),
  fetchTeams: vi.fn(),
  push: vi.fn().mockResolvedValue(undefined),
}));
const fixture: Fixture = {
  id: 1, game_week: 4,
  home_team: { id: 1, name: 'Home', short_name: 'HOM' },
  away_team: { id: 2, name: 'Away', short_name: 'AWY' },
  home_team_score: 1, away_team_score: 0,
};
const store = reactive({
  fixtures: [] as Fixture[], selectedGameweek: 4,
  fetchFixtures: mocks.fetchFixtures,
  checkWeekVerificationStatus: () => false,
});
mockNuxtImport('useRoute', () => () => ({ query: { week: '4' } }));
mockNuxtImport('useRouter', () => () => ({
  push: mocks.push, afterEach: vi.fn(), beforeEach: vi.fn(),
  beforeResolve: vi.fn(), onError: vi.fn(),
}));
mockNuxtImport('useSupabaseClient', () => () => ({}));
vi.mock('@nuxt/ui/composables', () => ({ useToast: () => ({ add: vi.fn() }) }));
vi.mock('~/stores/fixtures', () => ({ useFixtureStore: () => store }));
vi.mock('~/stores/draftedTeams', () => ({
  useDraftedTeamsStore: () => ({ fetchDraftedTeamsWithPlayerPointsByGameweek: mocks.fetchTeams }),
}));
vi.mock('~/composables/useAppSettings', () => ({
  useAppSettings: () => ({ getCurrentGameweek: mocks.getCurrentGameweek }),
}));

describe('fixture week selection while loading', () => {
  let page: ReturnType<typeof shallowMount> | undefined;
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentGameweek.mockReset().mockResolvedValue(4);
    mocks.fetchFixtures.mockReset().mockImplementation(async (week: number) => {
      store.fixtures = [{ ...fixture, game_week: week }];
    });
    mocks.fetchTeams.mockReset().mockImplementation(async () => [createMockDraftedTeam()]);
    store.fixtures = [];
    store.selectedGameweek = 4;
  });
  afterEach(() => {
    page?.unmount();
  });

  it('locks selection until settings and points load, then loads the selected week consistently', async () => {
    let finishSettings!: (week: number) => void;
    mocks.getCurrentGameweek.mockImplementationOnce(() => new Promise((resolve) => {
      finishSettings = resolve;
    }));
    let finishPoints!: (teams: ReturnType<typeof createMockDraftedTeam>[]) => void;
    mocks.fetchTeams.mockImplementationOnce(() => new Promise((resolve) => {
      finishPoints = resolve;
    }));
    page = shallowMount(FixturesPage);
    const selector = page.findComponent({ name: 'USelectMenu' });
    expect(selector.props('disabled')).toBe(true);

    finishSettings(4);
    await flushPromises();
    expect(selector.props('disabled')).toBe(true);
    finishPoints([createMockDraftedTeam()]);
    await flushPromises();
    expect(selector.props('disabled')).toBe(false);
    expect(mocks.fetchFixtures).toHaveBeenCalledOnce();

    mocks.fetchTeams.mockImplementationOnce(() => new Promise((resolve) => {
      finishPoints = resolve;
    }));
    selector.vm.$emit('update:modelValue', 5);
    await flushPromises();
    expect(selector.props('disabled')).toBe(true);
    finishPoints([createMockDraftedTeam()]);
    await flushPromises();

    expect(selector.props('disabled')).toBe(false);
    expect(selector.props('modelValue')).toBe(5);
    expect(store.fixtures[0]?.game_week).toBe(5);
    expect(store.selectedGameweek).toBe(5);
    expect(mocks.fetchTeams).toHaveBeenLastCalledWith(5);
    expect(mocks.push).toHaveBeenLastCalledWith({ path: 'fixtures', query: { week: 5 } });
  });

  it('unlocks the selector after a failed load so another week can be selected', async () => {
    page = shallowMount(FixturesPage);
    await flushPromises();
    const selector = page.findComponent({ name: 'USelectMenu' });
    mocks.fetchFixtures.mockRejectedValueOnce(new Error('Load failed'));
    selector.vm.$emit('update:modelValue', 5);
    await flushPromises();

    expect(selector.props('disabled')).toBe(false);
    selector.vm.$emit('update:modelValue', 6);
    await flushPromises();

    expect(selector.props('disabled')).toBe(false);
    expect(store.fixtures[0]?.game_week).toBe(6);
    expect(store.selectedGameweek).toBe(6);
  });
});
