// src/analytics/helpers/retryTracker.ts

const retryCounts = new Map<string, number>();

export function incrementRetry(
  challengeId: string
): number {
  const count =
    (retryCounts.get(challengeId) ?? 0) + 1;

  retryCounts.set(challengeId, count);

  return count;
}

export function resetRetryCount(
  challengeId: string
) {
  retryCounts.delete(challengeId);
}