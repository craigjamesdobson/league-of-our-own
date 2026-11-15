import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useFixtureStore } from '~/stores/fixtures';
import type { Fixture } from '~/types/Fixture';
import type { PlayerWithStats } from '~/types/Player';
import { createMockPlayer } from '~/tests/factories';
import { useLeagueDataChanges } from '~/composables/useLeagueDataChanges';

const { from, rpc } = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn() }));
mockNuxtImport('useSupabaseClient', () => () => ({ from, rpc }));
mockNuxtImport('useSupabaseUser', () => () => ref({ id: 'admin' }));
mockNuxtImport('useRoute', () => () => ({ query: { week: '4' } }));
vi.mock('~/stores/players', () => ({ usePlayerStore: () => ({ players: [] }) }));

const fixture: Fixture = {
  id: 1,
  game_week: 4,
  home_team: { id: 1, name: 'Home', short_name: 'HOM' },
  away_team: { id: 2, name: 'Away', short_name: 'AWY' },
  home_team_score: 0,
  away_team_score: 0,
  populated_by: 'populator',
  populated_at: '2026-10-01T12:00:00Z',
};

const playerWithStats = (overrides: Partial<PlayerWithStats>): PlayerWithStats => ({
  ...createMockPlayer(),
  week_goals: 0,
  week_assists: 0,
  week_redcard: false,
  week_cleansheet: false,
  week_points: 0,
  ...overrides,
});

const queryResponse = (data: Fixture | null, error: { message: string } | null = null) => {
  const response = { data, error };
  return {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    returns: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(response),
    then: (resolve: (value: typeof response) => unknown) => Promise.resolve(response).then(resolve),
  };
};

describe('fixture save state', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  it.each([true, false])('synchronises verification and profile data with the shared fixture list (verified: %s)', async (verified) => {
    const store = useFixtureStore();
    const otherFixture = { ...fixture, id: 2 };
    store.fixtures = [{ ...fixture }, otherFixture];
    const savedFixture = {
      ...fixture,
      verified_by: verified ? 'admin' : null,
      verified_at: verified ? '2026-10-02T12:00:00Z' : null,
      verified_profile: verified ? { full_name: 'Admin' } : null,
    };
    from.mockReturnValueOnce(queryResponse(null)).mockReturnValueOnce(queryResponse(savedFixture));

    await store.updateFixtureVerificationStatus(1, verified);

    expect(store.fixtures).toEqual([savedFixture, otherFixture]);
  });

  it('saves the score and the player statistics in a single request', async () => {
    const store = useFixtureStore();
    rpc.mockResolvedValue({ error: null });
    from.mockReturnValue(queryResponse({ ...fixture, home_team_score: 2 }));

    await store.saveFixtureResult({ ...fixture, home_team_score: 2 }, [
      playerWithStats({ player_id: 10, week_goals: 2, week_points: 6 }),
      playerWithStats({ player_id: 11, week_redcard: true, week_points: -10 }),
      playerWithStats({ player_id: 12 }),
    ]);

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('save_fixture_result', {
      p_fixture_id: 1,
      p_home_team_score: 2,
      p_away_team_score: 0,
      p_player_statistics: [
        { player_id: 10, goals: 2, assists: 0, clean_sheet: false, red_card: false, points: 6 },
        { player_id: 11, goals: 0, assists: 0, clean_sheet: false, red_card: true, points: -10 },
      ],
    });
    expect(from).not.toHaveBeenCalledWith('player_statistics');
  });

  it('keeps cached scores unchanged when saving fails', async () => {
    const store = useFixtureStore();
    store.fixtures = [{ ...fixture }];
    rpc.mockResolvedValue({ error: { message: 'Save failed' } });

    await expect(store.saveFixtureResult({ ...fixture, home_team_score: 2 }, [])).rejects.toThrow('Save failed');

    expect(store.fixtures).toEqual([fixture]);
  });

  it('keeps unsaved editor changes separate from the cached fixture list', async () => {
    const store = useFixtureStore();
    store.fixtures = [{ ...fixture }];
    from.mockReturnValueOnce(queryResponse({ ...fixture }));
    const editingFixture = await store.fetchFixtureByID(1);
    editingFixture!.home_team_score = 3;
    rpc.mockResolvedValue({ error: { message: 'Save failed' } });

    await expect(store.saveFixtureResult(editingFixture!, [])).rejects.toThrow('Save failed');

    expect(store.fixtures[0]?.home_team_score).toBe(0);
  });

  it('saves a fixture opened directly before the week list has loaded', async () => {
    const store = useFixtureStore();
    const savedFixture = { ...fixture, home_team_score: 2, populated_profile: { full_name: 'Admin' } };
    rpc.mockResolvedValue({ error: null });
    from.mockReturnValueOnce(queryResponse(savedFixture));

    await expect(store.saveFixtureResult(savedFixture, [])).resolves.toEqual(savedFixture);

    expect(store.fixtures).toBeNull();
  });

  it('shows the saved score in the shared fixture list', async () => {
    const store = useFixtureStore();
    const otherFixture = { ...fixture, id: 2 };
    store.fixtures = [{ ...fixture }, otherFixture];
    const savedFixture = { ...fixture, home_team_score: 2 };
    rpc.mockResolvedValue({ error: null });
    from.mockReturnValueOnce(queryResponse(savedFixture));

    await store.saveFixtureResult(savedFixture, []);

    expect(store.fixtures).toEqual([savedFixture, otherFixture]);
  });

  it('updates dependent views after a fixture result is saved', async () => {
    const store = useFixtureStore();
    const { playerStatisticsRevision } = useLeagueDataChanges();
    const beforeSave = playerStatisticsRevision.value;
    rpc.mockResolvedValue({ error: null });
    from.mockReturnValue(queryResponse({ ...fixture }));

    await store.saveFixtureResult(fixture, []);

    expect(playerStatisticsRevision.value).toBe(beforeSave + 1);
  });

  it('does not update dependent views when a fixture result fails to save', async () => {
    const store = useFixtureStore();
    const { playerStatisticsRevision } = useLeagueDataChanges();
    const beforeSave = playerStatisticsRevision.value;
    rpc.mockResolvedValue({ error: { message: 'Save failed' } });

    await expect(store.saveFixtureResult(fixture, [])).rejects.toThrow('Save failed');

    expect(playerStatisticsRevision.value).toBe(beforeSave);
  });
});
