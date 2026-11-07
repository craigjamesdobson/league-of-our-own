import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useRecentForm } from '~/composables/useRecentForm';
import { withSetup } from '~/tests/setup';
import { formFixtures, formScores, formTeams } from './fixtures';

const { mockFrom, mockEq, mockLte } = vi.hoisted(() => ({ mockFrom: vi.fn(), mockEq: vi.fn(), mockLte: vi.fn() }));
const season = ref('26-27');
vi.mock('~/composables/useAppSettings', () => ({ useAppSettings: () => ({ activeSeason: season }) }));
mockNuxtImport('useSupabaseClient', () => () => ({ from: mockFrom }));

type Response = { data: unknown; error: { message: string } | null };
const response = (table: string): Response => ({
  data: table === 'drafted_teams' ? formTeams : table === 'fixtures' ? formFixtures : formScores,
  error: null,
});
const chain = (result: Response | Promise<Response>) => ({
  select() { return this; },
  order() { return this; },
  range() { return this; },
  eq(...args: unknown[]) {
    mockEq(...args);
    return this;
  },
  lte(...args: unknown[]) {
    mockLte(...args);
    return this;
  },
  then(resolve: (value: Response) => unknown) { return Promise.resolve(result).then(resolve); },
});

beforeEach(() => {
  vi.clearAllMocks();
  season.value = '26-27';
  mockFrom.mockImplementation((table: string) => chain(response(table)));
});

describe('recent form data loading', () => {
  it('scopes scores and teams to the active season and reports the last five completed gameweeks', async () => {
    const [form, app] = withSetup(() => useRecentForm(ref(6)));
    await flushPromises();
    expect(mockEq).toHaveBeenCalledWith('active_season', '26-27');
    expect(mockEq).toHaveBeenCalledWith('drafted_teams.active_season', '26-27');
    expect(mockLte).toHaveBeenCalledWith('week', 6);
    expect(mockLte).toHaveBeenCalledWith('game_week', 6);
    expect(form.summary.value.weeks).toEqual([2, 3, 4, 5, 6]);
    expect(form.summary.value.inForm[0]?.totalPoints).toBe(75);
    expect(form.summary.value.canCompare).toBe(false);
    expect(mockFrom).toHaveBeenCalledTimes(3);
    expect(form.error.value).toBeNull();
    app.unmount();
  });

  it('loads the next score page instead of truncating a longer season at the database row limit', async () => {
    let page = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table !== 'weekly_statistics') return chain(response(table));
      page += 1;
      return chain({
        data: page === 1
          ? Array.from({ length: 1000 }, () => ({ team: null, week: 1, points: 0, goals: 0 }))
          : formScores,
        error: null,
      });
    });
    const [form, app] = withSetup(() => useRecentForm(ref(6)));
    await flushPromises();
    expect(page).toBe(2);
    expect(form.summary.value.weeks).toHaveLength(5);
    expect(form.summary.value.inForm[0]?.totalPoints).toBe(75);
    app.unmount();
  });

  it('does not query until the configured gameweek is available', async () => {
    const week = ref<number | null>(null);
    const [form, app] = withSetup(() => useRecentForm(week));
    await flushPromises();
    expect(mockFrom).not.toHaveBeenCalled();
    week.value = 6;
    await flushPromises();
    expect(form.summary.value.weeks).toHaveLength(5);
    app.unmount();
  });

  it('shows a retryable error for a failed query and recovers', async () => {
    mockFrom.mockImplementation((table: string) => chain({ ...response(table), error: { message: 'Unavailable' } }));
    const [form, app] = withSetup(() => useRecentForm(ref(6)));
    await flushPromises();
    expect(form.error.value).toContain('could not be loaded');
    expect(form.summary.value.weeks).toEqual([]);
    mockFrom.mockImplementation((table: string) => chain(response(table)));
    await form.reload();
    expect(form.error.value).toBeNull();
    expect(form.summary.value.weeks).toHaveLength(5);
    app.unmount();
  });

  it('rejects malformed database responses instead of showing invalid figures', async () => {
    mockFrom.mockImplementation((table: string) => chain(table === 'weekly_statistics' ? { data: [{ points: 'wrong' }], error: null } : response(table)));
    const [form, app] = withSetup(() => useRecentForm(ref(6)));
    await flushPromises();
    expect(form.error.value).toContain('could not be loaded');
    expect(form.summary.value.inForm).toEqual([]);
    app.unmount();
  });

  it('does not replace a newer gameweek with a late response from an older request', async () => {
    let finish: (value: Response) => void = () => {};
    const delayed = new Promise<Response>((resolve) => {
      finish = resolve;
    });
    mockFrom.mockImplementationOnce(() => chain(delayed));
    const week = ref<number | null>(3);
    const [form, app] = withSetup(() => useRecentForm(week));
    await flushPromises();
    week.value = 6;
    await flushPromises();
    expect(form.summary.value.weeks).toHaveLength(5);
    finish({ data: [], error: null });
    await flushPromises();
    expect(form.summary.value.weeks).toHaveLength(5);
    app.unmount();
  });

  it('clears old season data and ignores its pending response after the active season changes', async () => {
    let finish: (value: Response) => void = () => {};
    const delayed = new Promise<Response>((resolve) => {
      finish = resolve;
    });
    mockFrom.mockImplementationOnce(() => chain(delayed));
    const [form, app] = withSetup(() => useRecentForm(ref(6)));
    await flushPromises();
    mockFrom.mockImplementation(() => chain({ data: [], error: null }));
    season.value = '27-28';
    await flushPromises();
    finish(response('drafted_teams'));
    await flushPromises();
    expect(form.summary.value.weeks).toEqual([]);
    expect(mockEq).toHaveBeenCalledWith('active_season', '27-28');
    app.unmount();
  });
});
