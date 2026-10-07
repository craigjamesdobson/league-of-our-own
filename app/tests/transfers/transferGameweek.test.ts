// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { getTransferTargetGameweek } from '../../../shared/utils/transferGameweek';

describe('transfer target gameweek', () => {
  it.each([[1, 2], [7, 8], [37, 38]])('targets gameweek %i + 1 as %i', (current, target) => {
    expect(getTransferTargetGameweek(current)).toBe(target);
  });

  it('closes requests when the final gameweek is active', () => {
    expect(getTransferTargetGameweek(38)).toBeNull();
  });

  it.each([0, -1, 39, 7.5, Number.NaN, Number.POSITIVE_INFINITY])('does not invent a target for invalid gameweek %s', (current) => {
    expect(getTransferTargetGameweek(current)).toBeNull();
  });
});
