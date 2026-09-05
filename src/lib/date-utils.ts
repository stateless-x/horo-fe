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
 * Milliseconds until the first day of the next month, 00:00 Bangkok time.
 *
 * The backend regenerates a chart narrative when the Bangkok-time month rolls
 * over, so this is the point at which a chart already in a React Query cache
 * stops being current. Used as staleTime so a tab left open across the
 * boundary refetches instead of showing last month's reading until reload.
 */
export function getMsUntilBangkokMonthEnd(): number {
  const thaiNow = getBangkokDate();

  // Both operands stay in Bangkok wall-clock space, same as
  // getMsUntilThaiMidnight, so the difference is a real duration.
  const nextMonth = new Date(thaiNow.getFullYear(), thaiNow.getMonth() + 1, 1);

  // Minimum 1 minute to avoid edge cases at exactly the boundary
  return Math.max(nextMonth.getTime() - thaiNow.getTime(), 60 * 1000);
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
 *
 * This is the FALLBACK. A chart generated after the backend started stamping
 * readingPeriod carries its own month, which is the truth for a legacy row or
 * for a tab that has not yet refetched across the boundary. Prefer the data.
 */
export function getChartReadingPeriod(): {
  currentMonth: string;
  renewsOn: string;
  yearBe: number;
  yearMonth: string;
} {
  const now = getBangkokDate();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const month = now.getMonth();

  return {
    currentMonth: THAI_MONTHS[month],
    renewsOn: `1 ${THAI_MONTHS[nextMonth.getMonth()]}`,
    // Buddhist Era, matching the backend's toBuddhistYear (Gregorian + 543).
    yearBe: now.getFullYear() + 543,
    yearMonth: `${now.getFullYear()}-${String(month + 1).padStart(2, '0')}`,
  };
}

/** The readingPeriod the backend stamps onto a chart (StructuredChartResponse). */
export interface ChartReadingPeriod {
  yearMonth: string;
  monthTh: string;
  yearBe: number;
}

/**
 * The month to display for a chart, preferring what the backend recorded.
 *
 * Every place that names the period must call this, or the header and the
 * renewal note can disagree: a legacy chart has no readingPeriod and falls
 * back to the clock, which names the current month rather than the month the
 * narrative was actually written for.
 */
export function resolveChartReadingPeriod(readingPeriod?: ChartReadingPeriod): {
  monthTh: string;
  yearBe: number;
  renewsOn: string;
} {
  const fallback = getChartReadingPeriod();

  if (!readingPeriod) {
    return { monthTh: fallback.currentMonth, yearBe: fallback.yearBe, renewsOn: fallback.renewsOn };
  }

  // renewsOn follows the stamped month, not the clock, so a chart still
  // showing an older period does not claim it renews next month.
  const [year, month] = readingPeriod.yearMonth.split('-').map(Number);
  const next = new Date(year, month, 1);

  return {
    monthTh: readingPeriod.monthTh,
    yearBe: readingPeriod.yearBe,
    renewsOn: `1 ${THAI_MONTHS[next.getMonth()]}`,
  };
}
