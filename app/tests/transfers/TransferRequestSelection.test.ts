import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { defineComponent, type PropType } from 'vue';
import type { z } from 'zod';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TransferRequestForm from '~/components/TransferRequestForm.vue';
import DraftedPlayerEditDialog from '~/components/Drafted/DraftedPlayerEditDialog.vue';
import type { PlayerWithSeasonStatistics } from '~/types/Player';
import type { TransferHistory, TransferRequest } from '~/types/TransferRequest';
import {
  createMockDraftedPlayerWithWeeklyStats,
  createMockDraftedTeam,
  createMockPlayer,
} from '~/tests/factories';

const { requestTransfer, playerStore, applyTransfer, addToast } = vi.hoisted(() => {
  const players: PlayerWithSeasonStatistics[] = [];
  return {
    requestTransfer: vi.fn(),
    playerStore: { players },
    applyTransfer: vi.fn(),
    addToast: vi.fn(),
  };
});

mockNuxtImport('usePlayerStore', () => () => playerStore);
mockNuxtImport('useDraftedTeamsStore', () => () => ({ addNewTransfer: applyTransfer }));
mockNuxtImport('useAppSettings', () => () => ({ getCurrentGameweek: async () => 4 }));
vi.mock('@nuxt/ui/composables', async importOriginal => ({
  ...await importOriginal<typeof import('@nuxt/ui/composables')>(),
  useToast: () => ({ add: addToast }),
}));

const SlotStub = defineComponent({
  template: '<div><slot /><slot name="body" /><slot name="content" /></div>',
});

const FormStub = defineComponent({
  props: {
    schema: { type: Object as PropType<z.ZodType>, required: true },
    state: { type: Object, required: true },
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const submit = () => {
      const parsed = props.schema.safeParse(props.state);
      if (parsed.success) emit('submit', { data: parsed.data });
    };
    return { submit };
  },
  template: '<form @submit.prevent="submit"><slot /></form>',
});

const ButtonStub = defineComponent({
  props: { label: { type: String, default: '' } },
  template: '<button>{{ label }}<slot /></button>',
});

const TurnstileStub = defineComponent({
  emits: ['update:modelValue'],
  template: '<button type="button" data-testid="security-check" @click="$emit(\'update:modelValue\', \'verified-test-token\')">Complete security check</button>',
});

const firstOutgoing = createMockDraftedPlayerWithWeeklyStats({
  drafted_player_id: 11,
  data: createMockPlayer({ player_id: 1, web_name: 'First outgoing', cost: 5 }),
});
const secondOutgoing = createMockDraftedPlayerWithWeeklyStats({
  drafted_player_id: 12,
  data: createMockPlayer({ player_id: 2, web_name: 'Second outgoing', cost: 5 }),
});
const createSelectionPlayer = (overrides: Parameters<typeof createMockPlayer>[0]): PlayerWithSeasonStatistics => ({
  ...createMockPlayer(overrides),
  season_goals: 0,
  season_assists: 0,
  season_clean_sheets: 0,
  season_red_cards: 0,
  season_points: 0,
});
const firstIncoming = createSelectionPlayer({ player_id: 3, web_name: 'First incoming', cost: 5 });
const secondIncoming = createSelectionPlayer({ player_id: 4, web_name: 'Second incoming', cost: 5 });
const team = createMockDraftedTeam({
  allowed_transfers: true,
  players: [firstOutgoing, secondOutgoing],
});

const mountRequest = (options: {
  transferHistory?: TransferHistory;
  transferCounts?: { beforeJanuary: number; afterJanuary: number };
  pendingRequest?: TransferRequest;
} = {}) => mountSuspended(TransferRequestForm, {
  props: {
    teams: [team],
    players: [firstIncoming, secondIncoming],
    teamKey: team.key,
    activeGameweek: 4,
    targetGameweek: 5,
    compact: true,
    transferCounts: { [team.drafted_team_id]: options.transferCounts ?? { beforeJanuary: 0, afterJanuary: 0 } },
    transferHistory: options.transferHistory ?? { beforeJanuary: [], afterJanuary: [] },
    pendingRequest: options.pendingRequest,
  },
  global: {
    stubs: {
      UForm: FormStub,
      UButton: ButtonStub,
      UAlert: defineComponent({
        props: { description: { type: String, default: '' } },
        template: '<div>{{ description }}</div>',
      }),
      UBadge: SlotStub,
      UPopover: SlotStub,
      UTooltip: SlotStub,
      UIcon: true,
      NuxtTurnstile: TurnstileStub,
    },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-07T12:00:00Z'));
  requestTransfer.mockResolvedValue({ emailsSent: true });
  vi.stubGlobal('$fetch', requestTransfer);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('transfer request selections', () => {
  it.each([
    { date: '2026-10-07T12:00:00Z', slot: 2, beforeJanuary: 1, afterJanuary: 0 },
    { date: '2027-02-07T12:00:00Z', slot: 2, beforeJanuary: 0, afterJanuary: 1 },
  ])('clears the remaining selection after a completed transfer on $date', async ({ date, slot, beforeJanuary, afterJanuary }) => {
    vi.setSystemTime(new Date(date));
    const completed = { playerOut: 'Previous outgoing', playerIn: 'Previous incoming', transferWeek: 3 };
    const wrapper = await mountRequest({
      transferCounts: { beforeJanuary, afterJanuary },
      transferHistory: {
        beforeJanuary: beforeJanuary ? [completed] : [],
        afterJanuary: afterJanuary ? [completed] : [],
      },
    });
    wrapper.vm.addTransferSelection(11, firstIncoming);
    await flushPromises();
    await wrapper.get(`[aria-label="Clear transfer ${slot}"]`).trigger('click');

    expect(wrapper.text()).not.toContain('First incoming');
    expect(wrapper.find('[aria-label^="Clear transfer"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('keeps the second transfer submittable when the first selection is removed', async () => {
    const wrapper = await mountRequest();
    wrapper.vm.addTransferSelection(11, firstIncoming);
    wrapper.vm.addTransferSelection(12, secondIncoming);
    await flushPromises();
    await wrapper.get('[aria-label="Clear transfer 1"]').trigger('click');
    await wrapper.get('[data-testid="security-check"]').trigger('click');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(requestTransfer).toHaveBeenCalledWith('/api/transfer-request', expect.objectContaining({
      body: expect.objectContaining({
        firstPlayerOutId: 12,
        firstPlayerInId: 4,
        firstPlayerOut: 'Second outgoing',
        firstPlayerIn: 'Second incoming',
        secondPlayerOutId: null,
        secondPlayerInId: null,
      }),
    }));
    wrapper.unmount();
  });

  it('clears the remaining selection after the first of two selections is removed', async () => {
    const wrapper = await mountRequest();
    wrapper.vm.addTransferSelection(11, firstIncoming);
    wrapper.vm.addTransferSelection(12, secondIncoming);
    await flushPromises();
    await wrapper.get('[aria-label="Clear transfer 1"]').trigger('click');
    await wrapper.get('[aria-label="Clear transfer 1"]').trigger('click');

    expect(wrapper.text()).not.toContain('Second incoming');
    expect(wrapper.find('[aria-label^="Clear transfer"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('blocks an over-budget request until a second replacement balances it', async () => {
    const upgrade = createSelectionPlayer({ player_id: 3, web_name: 'Upgrade', cost: 7 });
    const downgrade = createSelectionPlayer({ player_id: 4, web_name: 'Downgrade', cost: 3 });
    const wrapper = await mountRequest();
    await wrapper.setProps({
      teams: [{
        ...team,
        players: [
          ...team.players,
          createMockDraftedPlayerWithWeeklyStats({ drafted_player_id: 15, data: createMockPlayer({ player_id: 15, cost: 75 }) }),
        ],
      }],
      players: [upgrade, downgrade],
    });
    wrapper.vm.addTransferSelection(11, upgrade);
    await flushPromises();
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined();
    await wrapper.get('[data-testid="security-check"]').trigger('click');
    await wrapper.get('form').trigger('submit');
    expect(requestTransfer).not.toHaveBeenCalled();

    wrapper.vm.addTransferSelection(12, downgrade);
    await flushPromises();
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined();
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(requestTransfer).toHaveBeenCalledWith('/api/transfer-request', expect.objectContaining({
      body: expect.objectContaining({ firstPlayerInId: 3, secondPlayerInId: 4 }),
    }));
    wrapper.unmount();
  });

  it('retains the saved transfer number when cancelling a request after a used allowance slot', async () => {
    const wrapper = await mountRequest({
      transferCounts: { beforeJanuary: 1, afterJanuary: 0 },
      transferHistory: {
        beforeJanuary: [{ playerOut: 'Previous outgoing', playerIn: 'Previous incoming', transferWeek: 3 }],
        afterJanuary: [],
      },
      pendingRequest: {
        transfer_request_id: 21,
        drafted_team_id: team.drafted_team_id,
        active_season: team.active_season,
        requester_name: team.team_owner,
        requester_email: team.team_email,
        target_gameweek: 5,
        status: 'pending',
        created_at: '2026-10-07T12:00:00Z',
        cancelled_at: null,
        reviewed_at: null,
        reviewed_by: null,
        items: [{
          transfer_request_item_id: 31,
          transfer_request_id: 21,
          transfer_number: 1,
          drafted_player_id: 11,
          player_id: 3,
          player_out: 'First outgoing',
          player_in: 'First incoming',
        }],
      },
    });
    expect(wrapper.find('[aria-label="Remove transfer 2"]').exists()).toBe(true);
    const confirmation = wrapper.findAll('button').find(button => button.text() === 'Yes, remove transfer');
    expect(confirmation).toBeDefined();
    await confirmation?.trigger('click');
    await flushPromises();

    expect(requestTransfer).toHaveBeenCalledWith(
      `/api/team-management/${team.key}/transfer-request/item-cancel`,
      expect.objectContaining({ body: { transferRequestId: 21, transferNumber: 1 } }),
    );
    wrapper.unmount();
  });

  it.each([
    { beforeJanuary: 0, afterJanuary: 2, selected: 2, canSubmit: true },
    { beforeJanuary: 1, afterJanuary: 2, selected: 1, canSubmit: true },
    { beforeJanuary: 1, afterJanuary: 2, selected: 2, canSubmit: false },
    { beforeJanuary: 2, afterJanuary: 2, selected: 1, canSubmit: false },
  ])('checks the carried season allowance for $beforeJanuary + $afterJanuary used and $selected selected', async ({ beforeJanuary, afterJanuary, selected, canSubmit }) => {
    vi.setSystemTime(new Date('2027-02-07T12:00:00Z'));
    const history = (count: number, prefix: string) => Array.from({ length: count }, (_, index) => ({
      playerOut: `${prefix} outgoing ${index + 1}`,
      playerIn: `${prefix} incoming ${index + 1}`,
      transferWeek: 3,
    }));
    const wrapper = await mountRequest({
      transferCounts: { beforeJanuary, afterJanuary },
      transferHistory: {
        beforeJanuary: history(beforeJanuary, 'Before January'),
        afterJanuary: history(afterJanuary, 'After January'),
      },
    });
    wrapper.vm.addTransferSelection(11, firstIncoming);
    if (selected === 2) wrapper.vm.addTransferSelection(12, secondIncoming);
    await flushPromises();

    expect(wrapper.get('button[type="submit"]').attributes('disabled') === undefined).toBe(canSubmit);
    await wrapper.get('[data-testid="security-check"]').trigger('click');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(requestTransfer.mock.calls.length).toBe(canSubmit ? 1 : 0);
    wrapper.unmount();
  });

  it.each([3, 4])('shows all %i completed January transfers and the remaining allowance', async (used) => {
    vi.setSystemTime(new Date('2027-02-07T12:00:00Z'));
    const wrapper = await mountRequest({
      transferCounts: { beforeJanuary: 0, afterJanuary: used },
      transferHistory: {
        beforeJanuary: [],
        afterJanuary: Array.from({ length: used }, (_, index) => ({
          playerOut: `Outgoing ${index + 1}`,
          playerIn: `January replacement ${index + 1}`,
          transferWeek: 3,
        })),
      },
    });
    expect(wrapper.text()).toContain(`January replacement ${used}`);
    wrapper.vm.addTransferSelection(11, firstIncoming);
    await flushPromises();
    expect(wrapper.find('[aria-label="Clear transfer 4"]').exists()).toBe(used === 3);
    expect(wrapper.get('button[type="submit"]').attributes('disabled') === undefined).toBe(used === 3);
    wrapper.unmount();
  });
});

describe('replacement selection budget', () => {
  it.each([true, false])('allows a provisional expensive replacement only in request mode (%s)', async (requestMode) => {
    const replacement = createSelectionPlayer({ player_id: 99, web_name: 'Upgrade', cost: 7 });
    playerStore.players = [replacement];
    const fullBudgetTeam = createMockDraftedTeam({
      allowed_transfers: true,
      players: [
        firstOutgoing,
        createMockDraftedPlayerWithWeeklyStats({ drafted_player_id: 15, data: createMockPlayer({ player_id: 15, cost: 80 }) }),
      ],
    });
    const wrapper = await mountSuspended(DraftedPlayerEditDialog, {
      props: {
        visible: true,
        draftedPlayer: firstOutgoing,
        team: fullBudgetTeam,
        requestMode,
        editable: !requestMode,
      },
      global: {
        stubs: {
          UModal: SlotStub,
          UForm: FormStub,
          UFormField: SlotStub,
          UButton: ButtonStub,
          USelectMenu: defineComponent({
            props: { items: { type: Array, default: () => [] } },
            emits: ['update:modelValue'],
            template: '<button type="button" data-testid="replacement" @click="$emit(\'update:modelValue\', items[0])">Choose replacement</button>',
          }),
          UInputNumber: true,
          DraftedPlayer: true,
        },
      },
    });
    await wrapper.get('[data-testid="replacement"]').trigger('click');
    const submitButton = wrapper.get('button[type="submit"]');

    expect(submitButton.attributes('disabled') === undefined).toBe(requestMode);
    if (requestMode) {
      expect(wrapper.text()).toContain('The complete request must stay within £85m');
      await wrapper.get('form').trigger('submit');
      expect(wrapper.emitted('requestTransfer')).toEqual([[expect.objectContaining(replacement)]]);
    }
    expect(applyTransfer).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
