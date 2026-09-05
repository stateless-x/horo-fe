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

/**
 * Thai month names, indexed 0-11 to match Date#getMonth().
 */
const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

/**
 * The month the current chart reading belongs to, and the date it is replaced.
 *
 * The backend regenerates a chart narrative when the Bangkok-time month rolls
 * over (systems/fortune/routes.ts), and the API exposes no expiry field — so
 * this is derived. It MUST be computed in Bangkok time, not the browser's
 * locale, or a user abroad (or one near midnight on the last day of the month)
 * would be shown a date that disagrees with when the reading actually changes.
 *
 * Only the narrative regenerates: pillars, birth star and element profile are
 * birth-derived and never change. Copy using this should say คำทำนาย, not ดวง.
 */
export function getChartReadingPeriod(): { currentMonth: string; renewsOn: string } {
  const now = getBangkokDate();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    currentMonth: THAI_MONTHS[now.getMonth()],
    renewsOn: `1 ${THAI_MONTHS[nextMonth.getMonth()]}`,
  };
}
