import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { describe, expect, it } from 'vitest';
import DraftedTeam from '~/components/Drafted/DraftedTeam.vue';
import {
  createMockDraftedPlayerWithWeeklyStats,
  createMockDraftedTransferWithWeeklyStats,
  createMockDraftedTeam,
  createMockPlayer,
  createMockTeamAdminMetadata,
} from '~/tests/factories';

const SlotStub = defineComponent({
  template: '<div><slot /><slot name="content" /></div>',
});

describe('DraftedTeam', () => {
  it('renders the submission history control when admin metadata is provided', () => {
    const wrapper = mount(DraftedTeam, {
      props: {
        draftedTeam: createMockDraftedTeam(),
        adminMetadata: createMockTeamAdminMetadata(),
      },
      global: {
        stubs: {
          DraftedPlayerEditDialog: true,
          Icon: true,
          UButton: defineComponent({
            inheritAttrs: false,
            template: '<button v-bind="$attrs" />',
          }),
          UCard: SlotStub,
          UPopover: SlotStub,
          UTooltip: SlotStub,
        },
      },
    });

    expect(wrapper.find('[aria-label="View submission history"]').exists()).toBe(true);
  });

  it('forwards request-mode transfers without using the live transfer editor', async () => {
    const replacement = createMockPlayer({
      player_id: 2,
      web_name: 'Replacement Player',
    });
    const RequestDialogStub = defineComponent({
      emits: ['requestTransfer'],
      template: '<button aria-label="Add transfer" @click="$emit(\'requestTransfer\', replacement)" />',
      setup() {
        return { replacement };
      },
    });
    const wrapper = mount(DraftedTeam, {
      props: {
        draftedTeam: createMockDraftedTeam({
          players: [createMockDraftedPlayerWithWeeklyStats()],
        }),
        transferRequestMode: true,
      },
      global: {
        stubs: {
          DraftedPlayer: true,
          DraftedPlayerEditDialog: RequestDialogStub,
          Icon: true,
          UButton: defineComponent({
            inheritAttrs: false,
            template: '<button v-bind="$attrs" />',
          }),
          UCard: SlotStub,
          UPopover: SlotStub,
          UTooltip: SlotStub,
        },
      },
    });

    await wrapper.find('[aria-label="Edit Player"]').trigger('click');
    await wrapper.find('[aria-label="Add transfer"]').trigger('click');

    expect(wrapper.emitted('transferRequested')).toEqual([[
      {
        draftedPlayerId: 1,
        player: replacement,
      },
    ]]);
  });

  it('keeps a future transfer out of the displayed team until its gameweek', () => {
    const originalPlayer = createMockPlayer({
      player_id: 1,
      web_name: 'Original Player',
    });
    const futurePlayer = createMockPlayer({
      player_id: 2,
      web_name: 'Future Player',
    });
    const draftedPlayer = createMockDraftedPlayerWithWeeklyStats({
      data: originalPlayer,
      transfers: [createMockDraftedTransferWithWeeklyStats({
        transfer_week: 5,
        data: futurePlayer,
      })],
    });

    const wrapper = mount(DraftedTeam, {
      props: {
        draftedTeam: createMockDraftedTeam({ players: [draftedPlayer] }),
        activeGameweek: 4,
      },
      global: {
        stubs: {
          DraftedPlayer: defineComponent({
            props: { draftedPlayer: { type: Object, required: true } },
            template: '<div data-testid="displayed-player">{{ draftedPlayer.data.web_name }}</div>',
          }),
          DraftedTransfer: defineComponent({
            props: { draftedPlayer: { type: Object, required: true } },
            template: '<div data-testid="displayed-transfer">{{ draftedPlayer.transfers.at(-1).data.web_name }}</div>',
          }),
          DraftedPlayerEditDialog: true,
          Icon: true,
          UCard: SlotStub,
          UButton: true,
          UPopover: SlotStub,
          UTooltip: SlotStub,
        },
      },
    });

    expect(wrapper.find('[data-testid="displayed-player"]').text()).toBe('Original Player');
    expect(wrapper.find('[data-testid="displayed-transfer"]').exists()).toBe(false);
  });

  it('preserves the effective transfer count while keeping future replacements hidden', async () => {
    const draftedPlayer = createMockDraftedPlayerWithWeeklyStats({
      data: createMockPlayer({ web_name: 'Original player' }),
      transfers: [
        createMockDraftedTransferWithWeeklyStats({
          drafted_transfer_id: 21,
          transfer_week: 2,
          data: createMockPlayer({ web_name: 'Earlier replacement' }),
        }),
        createMockDraftedTransferWithWeeklyStats({
          drafted_transfer_id: 22,
          transfer_week: 3,
          data: createMockPlayer({ web_name: 'Current replacement' }),
        }),
        createMockDraftedTransferWithWeeklyStats({
          drafted_transfer_id: 23,
          transfer_week: 5,
          data: createMockPlayer({ web_name: 'Future replacement' }),
        }),
      ],
    });
    const wrapper = mount(DraftedTeam, {
      props: {
        draftedTeam: createMockDraftedTeam({ players: [draftedPlayer] }),
        activeGameweek: 4,
      },
      global: {
        stubs: {
          DraftedPlayerEditDialog: true,
          Icon: true,
          UButton: true,
          UCard: SlotStub,
          UPopover: SlotStub,
          UTooltip: SlotStub,
        },
      },
    });

    expect(wrapper.text()).toContain('Current replacement');
    expect(wrapper.text()).not.toContain('Future replacement');
    expect(wrapper.get('[title="View transfer details"]').text()).toBe('2');

    await wrapper.setProps({ activeGameweek: 2 });
    expect(wrapper.text()).toContain('Earlier replacement');
    expect(wrapper.text()).not.toContain('Current replacement');
    expect(wrapper.find('[title="View transfer details"]').exists()).toBe(false);
    expect(draftedPlayer.transfers).toHaveLength(3);
    wrapper.unmount();
  });

  it('opens the full transfer history when the current player has a future transfer', async () => {
    const draftedPlayer = createMockDraftedPlayerWithWeeklyStats({
      transfers: [createMockDraftedTransferWithWeeklyStats({ transfer_week: 5 })],
    });
    const wrapper = mount(DraftedTeam, {
      props: {
        draftedTeam: createMockDraftedTeam({ players: [draftedPlayer] }),
        activeGameweek: 4,
      },
      global: {
        stubs: {
          DraftedPlayer: defineComponent({
            emits: ['click'],
            template: '<button data-testid="current-player" @click="$emit(\'click\')" />',
          }),
          DraftedPlayerEditDialog: defineComponent({
            props: { draftedPlayer: { type: Object, default: null } },
            template: '<div data-testid="history-length">{{ draftedPlayer?.transfers.length }}</div>',
          }),
          Icon: true,
          UButton: true,
          UCard: SlotStub,
          UPopover: SlotStub,
          UTooltip: SlotStub,
        },
      },
    });

    await wrapper.find('[data-testid="current-player"]').trigger('click');

    expect(wrapper.find('[data-testid="history-length"]').text()).toBe('1');
  });
});
