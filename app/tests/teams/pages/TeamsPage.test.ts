import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeamsPage from '~/pages/teams/index.vue';
import { createMockDraftedTeam, createMockTeamAdminMetadata } from '~/tests/factories';
import type { DraftedTeamWithPlayers, TeamAdminMetadata } from '~/types/DraftedTeam';

const user = ref<{ id: string } | null>(null);

const state = vi.hoisted(() => ({
  metadataLoaded: false,
  metadata: undefined as TeamAdminMetadata | undefined,
}));

const store = vi.hoisted(() => ({
  clearDraftedTeamAdminMetadata: vi.fn(),
  fetchDraftedTeamAdminMetadata: vi.fn().mockImplementation(async () => {
    state.metadataLoaded = true;
  }),
  fetchDraftedTeams: vi.fn().mockResolvedValue(undefined),
  getDraftedTeamAdminMetadataByID: vi.fn(() => state.metadataLoaded
    ? state.metadata
    : undefined),
  getDraftedTeams: [] as DraftedTeamWithPlayers[],
}));

mockNuxtImport('useSupabaseUser', () => {
  return () => user;
});

vi.mock('~/stores/draftedTeams', () => ({
  useDraftedTeamsStore: () => store,
}));

describe('teams page admin metadata', () => {
  beforeEach(() => {
    user.value = null;
    state.metadataLoaded = false;
    state.metadata = createMockTeamAdminMetadata();
    store.getDraftedTeams = [createMockDraftedTeam()];
    vi.clearAllMocks();
  });

  it('loads admin metadata when an authenticated session is restored after mount', async () => {
    const wrapper = mount(defineComponent({
      components: { TeamsPage },
      template: '<Suspense><TeamsPage /></Suspense>',
    }), {
      global: {
        stubs: {
          DraftedTeam: defineComponent({
            props: ['adminMetadata'],
            template: '<button v-if="adminMetadata" aria-label="View submission history" />',
          }),
          SkeletonDraftedTeam: true,
        },
      },
    });
    await flushPromises();

    expect(store.fetchDraftedTeamAdminMetadata).not.toHaveBeenCalled();

    user.value = { id: 'admin-user' };
    await flushPromises();
    await nextTick();

    expect(store.fetchDraftedTeamAdminMetadata).toHaveBeenCalledOnce();
    expect(wrapper.find('[aria-label="View submission history"]').exists()).toBe(true);
  });
});
