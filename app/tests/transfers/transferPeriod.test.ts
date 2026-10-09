// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { getTransferAvailability } from '../../../shared/utils/transferPeriod';

describe('transfer allowance with January carryover', () => {
  it('keeps the first-half cap until midnight in London on 1 January', () => {
    const counts = { beforeJanuary: 2, afterJanuary: 0 };
    expect(getTransferAvailability(counts, new Date('2026-12-31T23:59:59Z')).disabled).toBe(true);
    expect(getTransferAvailability(counts, new Date('2027-01-01T00:00:00Z')).disabled).toBe(false);
  });

  it.each([
    { beforeJanuary: 0, afterJanuary: 2, disabled: false },
    { beforeJanuary: 1, afterJanuary: 2, disabled: false },
    { beforeJanuary: 2, afterJanuary: 2, disabled: true },
    { beforeJanuary: 0, afterJanuary: 3, disabled: false },
    { beforeJanuary: 0, afterJanuary: 4, disabled: true },
  ])('uses the season total after January ($beforeJanuary + $afterJanuary)', ({ beforeJanuary, afterJanuary, disabled }) => {
    expect(getTransferAvailability(
      { beforeJanuary, afterJanuary },
      new Date('2027-02-01T12:00:00Z'),
    ).disabled).toBe(disabled);
  });

  it('explains that all four transfers have been used when no allowance remains', () => {
    expect(getTransferAvailability(
      { beforeJanuary: 1, afterJanuary: 3 },
      new Date('2027-02-01T12:00:00Z'),
    ).message).toContain('All four transfers have been used');
  });
});
