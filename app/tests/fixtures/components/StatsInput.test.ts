import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';
import StatsInput from '@/components/Fixture/StatsInput.vue';
import type { PlayerWithStats } from '@/types/Player';

const makePlayer = (id: number, webName: string, position: number): PlayerWithStats => ({
  player_id: id,
  web_name: webName,
  position,
  week_goals: 0,
  week_assists: 0,
  week_redcard: false,
  week_cleansheet: false,
  week_points: 0,
} as PlayerWithStats);

const players = [
  makePlayer(1, 'Alisson', 1),
  makePlayer(2, 'Gabriel', 2),
  makePlayer(3, 'Saliba', 2),
  makePlayer(4, 'Saka', 3),
  makePlayer(5, 'Odegaard', 3),
  makePlayer(6, 'Haaland', 4),
];

const mountStatsInput = () => mount(StatsInput, {
  props: {
    players: players.map(player => ({ ...player })),
    disableCleansheet: false,
  },
  global: {
    stubs: {
      Icon: true,
      UInput: defineComponent({
        props: {
          modelValue: {
            type: String,
            default: '',
          },
        },
        emits: ['update:modelValue'],
        template: `
          <input
            data-testid="player-search"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
          >
        `,
      }),
      UButton: defineComponent({
        props: {
          label: {
            type: String,
            default: '',
          },
          disabled: {
            type: Boolean,
            default: false,
          },
        },
        emits: ['click'],
        template: `
          <button
            type="button"
            :disabled="disabled"
            @click="$emit('click')"
          >
          {{ label }}
          </button>
        `,
      }),
      UTooltip: defineComponent({
        props: {
          text: {
            type: String,
            default: '',
          },
        },
        template: '<span><slot /></span>',
      }),
      UInputNumber: defineComponent({
        props: {
          modelValue: {
            type: Number,
            default: 0,
          },
        },
        emits: ['update:modelValue'],
        template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))">',
      }),
      UCheckbox: defineComponent({
        props: {
          modelValue: {
            type: Boolean,
            default: false,
          },
          disabled: {
            type: Boolean,
            default: false,
          },
        },
        emits: ['update:modelValue'],
        template: '<input type="checkbox" :checked="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.checked)">',
      }),
    },
  },
});

describe('Fixture StatsInput', () => {
  it('paginates the player rows', async () => {
    const wrapper = mountStatsInput();

    expect(wrapper.text()).toContain('Alisson');
    expect(wrapper.text()).toContain('Odegaard');
    expect(wrapper.text()).not.toContain('Haaland');

    await wrapper.findAll('button').at(-1)!.trigger('click');

    expect(wrapper.text()).toContain('Haaland');
  });

  it('filters players by position', async () => {
    const wrapper = mountStatsInput();

    await wrapper.findAll('button').find(button => button.text() === 'DEFENDER')!.trigger('click');

    expect(wrapper.text()).toContain('Gabriel');
    expect(wrapper.text()).toContain('Saliba');
    expect(wrapper.text()).not.toContain('Saka');
  });

  it('searches players by name', async () => {
    const wrapper = mountStatsInput();

    await wrapper.find('[data-testid="player-search"]').setValue('saka');

    expect(wrapper.text()).toContain('Saka');
    expect(wrapper.text()).not.toContain('Alisson');
  });
});
