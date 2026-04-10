/**
 * Date utilities for Thai timezone operations
 *
 * Standard: use `toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })` to get
 * Bangkok-local time rather than manual UTC+7 offsets.
 */

/**
 * Get the current date/time in Bangkok timezone (UTC+7).
 * Mirrors the backend getBangkokDate() helper.
 */
export function getBangkokDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
}

/**
 * Get milliseconds until midnight in Thai timezone (UTC+7).
 * Used for React Query staleTime so daily data stays fresh until the day changes.
 */
export function getMsUntilThaiMidnight(): number {
  const now = new Date();
  const thaiNow = getBangkokDate();

  // Next midnight in Thai time = today's date + 1 day, time 00:00:00 Bangkok
  const thaiMidnight = new Date(thaiNow);
  thaiMidnight.setHours(24, 0, 0, 0);

  // thaiMidnight is in "Bangkok-local" wall clock — compute real ms difference
  // by anchoring the difference to the original `now`
  const msUntilMidnight = thaiMidnight.getTime() - thaiNow.getTime();

  // Minimum 1 minute to avoid edge cases at exactly midnight
  return Math.max(msUntilMidnight, 60 * 1000);
}
