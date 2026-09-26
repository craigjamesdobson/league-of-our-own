// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { isTeamManagementLinkRateLimited } from '../../../server/utils/teamManagementLinkRateLimit';

describe('team management link rate limiting', () => {
  it('allows three requests and blocks the fourth for an email', () => {
    const email = `owner-${Date.now()}@example.com`;

    expect(isTeamManagementLinkRateLimited('ip-for-test', email, 1_000)).toBe(false);
    expect(isTeamManagementLinkRateLimited('ip-for-test', email, 2_000)).toBe(false);
    expect(isTeamManagementLinkRateLimited('ip-for-test', email, 3_000)).toBe(false);
    expect(isTeamManagementLinkRateLimited('ip-for-test', email, 4_000)).toBe(true);
  });

  it('also limits requests from one IP across different email addresses', () => {
    const timestamp = Date.now();
    const ip = `ip-${timestamp}`;

    expect(isTeamManagementLinkRateLimited(ip, `one-${timestamp}@example.com`, 1_000)).toBe(false);
    expect(isTeamManagementLinkRateLimited(ip, `two-${timestamp}@example.com`, 2_000)).toBe(false);
    expect(isTeamManagementLinkRateLimited(ip, `three-${timestamp}@example.com`, 3_000)).toBe(false);
    expect(isTeamManagementLinkRateLimited(ip, `four-${timestamp}@example.com`, 4_000)).toBe(true);
  });
});
