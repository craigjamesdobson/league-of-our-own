import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useFixtureStore } from '~/stores/fixtures';
import type { Fixture } from '~/types/Fixture';
import { useLeagueDataChanges } from '~/composables/useLeagueDataChanges';

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
mockNuxtImport('useSupabaseClient', () => () => ({ from }));
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

  it('keeps cached scores unchanged when saving fails', async () => {
    const store = useFixtureStore();
    store.fixtures = [{ ...fixture }];
    from.mockReturnValue(queryResponse(null, { message: 'Save failed' }));

    await expect(store.updateFixtureScore({ ...fixture, home_team_score: 2 })).rejects.toThrow('Save failed');

    expect(store.fixtures).toEqual([fixture]);
  });

  it('keeps unsaved editor changes separate from the cached fixture list', async () => {
    const store = useFixtureStore();
    store.fixtures = [{ ...fixture }];
    from.mockReturnValueOnce(queryResponse({ ...fixture }));
    const editingFixture = await store.fetchFixtureByID(1);
    editingFixture!.home_team_score = 3;
    from.mockReturnValueOnce(queryResponse(null, { message: 'Save failed' }));

    await expect(store.updateFixtureScore(editingFixture!)).rejects.toThrow('Save failed');

    expect(store.fixtures[0]?.home_team_score).toBe(0);
  });

  it('saves a fixture opened directly before the week list has loaded', async () => {
    const store = useFixtureStore();
    const savedFixture = { ...fixture, home_team_score: 2, populated_profile: { full_name: 'Admin' } };
    from.mockReturnValueOnce(queryResponse(null)).mockReturnValueOnce(queryResponse(savedFixture));

    await expect(store.updateFixtureScore(savedFixture)).resolves.toEqual(savedFixture);

    expect(store.fixtures).toBeNull();
  });

  it('updates dependent views after player statistics are successfully saved', async () => {
    const store = useFixtureStore();
    const { playerStatisticsRevision } = useLeagueDataChanges();
    const beforeSave = playerStatisticsRevision.value;
    from.mockReturnValue(queryResponse(null));

    await store.updatePlayerStatistics([], 1);

    expect(playerStatisticsRevision.value).toBe(beforeSave + 1);
  });

  it('does not update dependent views when player statistics fail to save', async () => {
    const store = useFixtureStore();
    const { playerStatisticsRevision } = useLeagueDataChanges();
    const beforeSave = playerStatisticsRevision.value;
    from.mockReturnValueOnce(queryResponse(null)).mockReturnValueOnce(queryResponse(null, { message: 'Save failed' }));

    await expect(store.updatePlayerStatistics([], 1)).rejects.toThrow('Save failed');

    expect(playerStatisticsRevision.value).toBe(beforeSave);
  });
});
