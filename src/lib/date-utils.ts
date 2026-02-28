/**
 * Date utilities for Thai timezone operations
 */

/**
 * Get milliseconds until midnight in Thai timezone (UTC+7).
 * Used for React Query staleTime so daily data stays fresh until the day changes.
 */
export function getMsUntilThaiMidnight(): number {
  const now = new Date();
  // Thai time is UTC+7
  const thaiOffsetMs = 7 * 60 * 60 * 1000;
  const thaiNow = new Date(now.getTime() + thaiOffsetMs);

  // Calculate next midnight in Thai time
  const thaiMidnight = new Date(thaiNow);
  thaiMidnight.setUTCHours(24, 0, 0, 0);

  // Convert back to UTC timestamp difference
  const msUntilMidnight = thaiMidnight.getTime() - thaiNow.getTime();

  // Minimum 1 minute to avoid edge cases at exactly midnight
  return Math.max(msUntilMidnight, 60 * 1000);
}
