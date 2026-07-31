import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Players from '@/components/Players.vue';
import { createMockPlayer } from '@/tests/factories/players';
import { usePlayerStore } from '@/stores/players';

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

const mountPlayers = () => {
  setActivePinia(createPinia());

  const playerStore = usePlayerStore();
  playerStore.players = [
    {
      ...createMockPlayer({ player_id: 1, web_name: 'Bukayo Saka' }),
      season_goals: 0,
      season_assists: 0,
      season_clean_sheets: 0,
      season_red_cards: 0,
      season_points: 0,
    },
    {
      ...createMockPlayer({ player_id: 2, web_name: 'Erling Haaland' }),
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
});
