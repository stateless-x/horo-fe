// Supported ?m=YYYY-MM range for /calendar — kept as the single source of
// truth for src/app/calendar/page.tsx and src/app/sitemap.ts. Page files
// under app/ can't export arbitrary named members (Next's typed-routes
// checker rejects it), so this lives in /lib instead.

export const CALENDAR_MIN_YEAR = 2024;
export const CALENDAR_MAX_YEAR = 2032;

/** True if `m` is a well-formed "YYYY-MM" string inside the supported range. */
export function isValidMonthParam(m: string | undefined): m is string {
  if (!m || !/^\d{4}-\d{2}$/.test(m)) return false;
  const [y, mo] = m.split('-').map(Number);
  return y >= CALENDAR_MIN_YEAR && y <= CALENDAR_MAX_YEAR && mo >= 1 && mo <= 12;
}
