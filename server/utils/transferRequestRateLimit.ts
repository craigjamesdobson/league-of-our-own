const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

const requestTimestamps = new Map<string, number[]>();

const pruneExpiredEntries = (now: number): void => {
  requestTimestamps.forEach((timestamps, key) => {
    const recentTimestamps = timestamps.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
    if (recentTimestamps.length) requestTimestamps.set(key, recentTimestamps);
    else requestTimestamps.delete(key);
  });
};

export const isTransferRequestRateLimited = (
  key: string,
  now = Date.now(),
): boolean => {
  pruneExpiredEntries(now);
  const recentRequests = (requestTimestamps.get(key) ?? [])
    .filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    requestTimestamps.set(key, recentRequests);
    return true;
  }

  requestTimestamps.set(key, [...recentRequests, now]);
  return false;
};
