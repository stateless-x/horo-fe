import { BE_OFFSET } from '../constants/thai-time';

/**
 * Converts Gregorian year to Buddhist Era year
 */
export function toBuddhistYear(gregorianYear: number): number {
  return gregorianYear + BE_OFFSET;
}

/**
 * Converts Buddhist Era year to Gregorian year
 */
export function toGregorianYear(buddhistYear: number): number {
  return buddhistYear - BE_OFFSET;
}

/**
 * Creates a UTC Date from Thai Buddhist Era date components
 * This prevents timezone issues when converting dates
 *
 * @param day - Day of month (1-31)
 * @param month - Month (1-12, NOT 0-11)
 * @param buddhistYear - Year in Buddhist Era (e.g., 2540)
 * @returns Date object in UTC
 *
 * @example
 * createUTCDateFromBE(25, 4, 2540) // April 25, 1997 00:00:00 UTC
 */
export function createUTCDateFromBE(day: number, month: number, buddhistYear: number): Date {
  const gregorianYear = toGregorianYear(buddhistYear);
  // Date.UTC expects month as 0-11, so subtract 1
  return new Date(Date.UTC(gregorianYear, month - 1, day));
}

/**
 * Creates a UTC Date from Gregorian date components
 * This prevents timezone issues when converting dates
 *
 * @param day - Day of month (1-31)
 * @param month - Month (1-12, NOT 0-11)
 * @param gregorianYear - Year in Gregorian calendar (e.g., 1997)
 * @returns Date object in UTC
 *
 * @example
 * createUTCDate(25, 4, 1997) // April 25, 1997 00:00:00 UTC
 */
export function createUTCDate(day: number, month: number, gregorianYear: number): Date {
  // Date.UTC expects month as 0-11, so subtract 1
  return new Date(Date.UTC(gregorianYear, month - 1, day));
}

/**
 * Formats a date to Thai Buddhist Era format
 * @param date - ISO date string or Date object
 * @returns Formatted date string like "25 ก.พ. 2569"
 */
export function formatThaiDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Use UTC methods since birth dates are stored as UTC midnight
  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = toBuddhistYear(d.getUTCFullYear());

  const THAI_MONTHS = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  return `${day} ${THAI_MONTHS[month]} ${year}`;
}

/**
 * Gets the current date in Bangkok timezone (UTC+7)
 */
export function getBangkokDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
}

/**
 * Gets today's date string in YYYY-MM-DD format, Bangkok timezone.
 * Use this for daily reading cache keys and DB lookups to ensure
 * the "day" matches what Thai users see on their calendar.
 */
export function getTodayBangkokString(): string {
  const d = getBangkokDate();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Gets the current year in Bangkok timezone.
 */
export function getBangkokYear(): number {
  return getBangkokDate().getFullYear();
}

/**
 * Gets the year of a given date in Bangkok timezone.
 */
export function getYearInBangkok(date: Date): number {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })).getFullYear();
}

/**
 * Checks if it's a new day in Bangkok timezone
 */
export function isMidnightBangkok(): boolean {
  const bangkokDate = getBangkokDate();
  return bangkokDate.getHours() === 0 && bangkokDate.getMinutes() === 0;
}
