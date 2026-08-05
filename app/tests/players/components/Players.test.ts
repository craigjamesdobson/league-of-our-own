import { mount } from '@vue/test-utils';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { computed, defineComponent, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Players from '@/components/Players.vue';
import { createMockPlayer } from '@/tests/factories/players';
import { usePlayerStore } from '@/stores/players';

const teamRegistrationOpen = ref(false);
const teamSubmissionDeadline = ref('2099-01-01');

mockNuxtImport('useAppSettings', () => () => ({
  teamRegistrationOpen: computed(() => teamRegistrationOpen.value),
  teamSubmissionDeadline: computed(() => teamSubmissionDeadline.value),
}));

const UInputStub = defineComponent({
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  template: '<input data-testid="player-search" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">',
});

const mountPlayers = (registrationOpen = false) => {
  setActivePinia(createPinia());
  teamRegistrationOpen.value = registrationOpen;

  const playerStore = usePlayerStore();
  playerStore.players = [
    {
      ...createMockPlayer({
        player_id: 1,
        web_name: 'Bukayo Saka',
        goals_scored: 0,
        assists: 0,
        clean_sheets: 0,
        red_cards: 0,
        total_points: 0,
        previous_season_goals: 7,
        previous_season_assists: 4,
        previous_season_clean_sheets: 6,
        previous_season_red_cards: 1,
        previous_season_points: 42,
        previous_season_minutes: 3330,
      }),
      season_goals: 0,
      season_assists: 0,
      season_clean_sheets: 0,
      season_red_cards: 0,
      season_points: 0,
    },
    {
      ...createMockPlayer({
        player_id: 2,
        web_name: 'Erling Haaland',
        goals_scored: 0,
        assists: 0,
        clean_sheets: 0,
        red_cards: 0,
        total_points: 0,
        previous_season_goals: 5,
        previous_season_assists: 3,
        previous_season_clean_sheets: 2,
        previous_season_red_cards: 0,
        previous_season_points: 30,
        previous_season_minutes: 2500,
      }),
      season_goals: 0,
      season_assists: 0,
      season_clean_sheets: 0,
      season_red_cards: 0,
      season_points: 0,
    },
  ];
  playerStore.isLoaded = true;

  return mount(Players, {
    global: {
      stubs: {
        UInput: UInputStub,
        UBadge: true,
        UButton: true,
        UPopover: true,
        USelectMenu: true,
        UTooltip: true,
        USelect: true,
        UDrawer: true,
        UIcon: true,
        UPagination: true,
      },
    },
  });
};

describe('Players', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces player-name filtering while keeping the input responsive', async () => {
    vi.useFakeTimers();
    const wrapper = mountPlayers();
    const search = wrapper.get('[data-testid="player-search"]');

    await search.setValue('saka');

    expect((search.element as HTMLInputElement).value).toBe('saka');
    expect(wrapper.text()).toContain('Erling Haaland');

    await vi.advanceTimersByTimeAsync(250);

    expect(wrapper.text()).not.toContain('Erling Haaland');
    expect(wrapper.text()).toContain('Bukayo Saka');
  });

  it('uses FPL previous-season stats while team building is open', async () => {
    const wrapper = mountPlayers(true);

    expect(wrapper.text()).toContain('42');
    expect(wrapper.text()).toContain('7');
    await wrapper.get('button[aria-expanded]').trigger('click');
    expect(wrapper.text()).toContain('3330 mins');

    teamRegistrationOpen.value = false;
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Showing calculated current-season stats');
    expect(wrapper.text()).toContain('0');
  });
});
