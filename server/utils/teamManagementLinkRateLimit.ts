const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;

const requestTimestamps = new Map<string, number[]>();

const pruneExpiredEntries = (now: number): void => {
  requestTimestamps.forEach((timestamps, key) => {
    const recentTimestamps = timestamps.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
    if (recentTimestamps.length) requestTimestamps.set(key, recentTimestamps);
    else requestTimestamps.delete(key);
  });
};

export const isTeamManagementLinkRateLimited = (
  requesterIP: string,
  email: string,
  now = Date.now(),
): boolean => {
  pruneExpiredEntries(now);
  const keys = [`ip:${requesterIP}`, `email:${email}`];
  const recentRequestsByKey = keys.map((key) => {
    const recentRequests = (requestTimestamps.get(key) ?? [])
      .filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);

    requestTimestamps.set(key, recentRequests);
    return recentRequests;
  });

  if (recentRequestsByKey.some(requests => requests.length >= MAX_REQUESTS_PER_WINDOW)) {
    return true;
  }

  keys.forEach((key, index) => {
    requestTimestamps.set(key, [...recentRequestsByKey[index]!, now]);
  });

  return false;
};
