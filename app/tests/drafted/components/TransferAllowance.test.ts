import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TransferAllowance from '~/components/Drafted/TransferAllowance.vue';
import {
  createMockDraftedPlayerWithWeeklyStats,
  createMockDraftedTeam,
  createMockDraftedTransferWithWeeklyStats,
} from '~/tests/factories';

const BadgeStub = defineComponent({
  props: ['color'],
  template: '<span :data-color="color"><slot /></span>',
});

const mountAllowance = (transferDates: string[]) => mount(TransferAllowance, {
  props: {
    draftedTeam: createMockDraftedTeam({
      allowed_transfers: true,
      players: [createMockDraftedPlayerWithWeeklyStats({
        transfers: transferDates.map((created_at, index) => createMockDraftedTransferWithWeeklyStats({
          drafted_transfer_id: index + 1,
          created_at,
        })),
      })],
    }),
  },
  global: { stubs: { UBadge: BadgeStub } },
});

describe('admin transfer allowance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-09T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    { used: 0, available: 2, remaining: 4, color: 'success' },
    { used: 1, available: 1, remaining: 3, color: 'warning' },
    { used: 2, available: 0, remaining: 2, color: 'error' },
  ])('distinguishes current and season availability with $used transfers used', ({ used, available, remaining, color }) => {
    const wrapper = mountAllowance(Array.from({ length: used }, () => '2026-09-01T12:00:00Z'));
    const badges = wrapper.findAll('[data-color]');

    expect(wrapper.text()).toContain('Available before 1 Jan');
    expect(badges[0]!.text()).toBe(`${available}/2`);
    expect(badges[0]!.attributes('data-color')).toBe(color);
    expect(wrapper.text()).toContain('Season remaining');
    expect(badges[1]!.text()).toBe(`${remaining}/4`);

    wrapper.unmount();
  });

  it('includes unused first-half transfers in availability after January', () => {
    vi.setSystemTime(new Date('2027-02-01T12:00:00Z'));
    const wrapper = mountAllowance(['2026-09-01T12:00:00Z']);
    const badges = wrapper.findAll('[data-color]');

    expect(wrapper.text()).toContain('Available now');
    expect(wrapper.text()).not.toContain('before 1 Jan');
    expect(badges[0]!.text()).toBe('3');
    expect(badges[1]!.text()).toBe('3/4');

    wrapper.unmount();
  });

  it('counts both periods towards the season limit after January', () => {
    vi.setSystemTime(new Date('2027-02-01T12:00:00Z'));
    const wrapper = mountAllowance([
      '2026-09-01T12:00:00Z',
      '2027-01-02T12:00:00Z',
      '2027-01-03T12:00:00Z',
      '2027-01-04T12:00:00Z',
    ]);
    const badges = wrapper.findAll('[data-color]');

    expect(badges[0]!.text()).toBe('0');
    expect(badges[0]!.attributes('data-color')).toBe('error');
    expect(badges[1]!.text()).toBe('0/4');

    wrapper.unmount();
  });

  it('unlocks the remaining allowance at midnight in London without reloading', async () => {
    vi.setSystemTime(new Date('2026-12-31T23:59:00Z'));
    const wrapper = mountAllowance([
      '2026-09-01T12:00:00Z',
      '2026-09-02T12:00:00Z',
    ]);
    expect(wrapper.findAll('[data-color]')[0]!.text()).toBe('0/2');

    vi.advanceTimersByTime(60_000);
    await nextTick();

    expect(wrapper.text()).toContain('Available now');
    expect(wrapper.findAll('[data-color]')[0]!.text()).toBe('2');

    wrapper.unmount();
  });
});
