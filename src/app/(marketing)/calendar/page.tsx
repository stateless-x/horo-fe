import { permanentRedirect, redirect } from 'next/navigation';
import { getBangkokNow } from '@/lib/calendar-data';
import { isValidMonthParam } from '@/lib/calendar-range';

/**
 * /calendar is the stable entry point; the months live at
 * /calendar/YYYY-MM as statically prerendered pages.
 *
 * Two jobs:
 *  - `?m=YYYY-MM` (the old URL shape, still in the wild and in older
 *    sitemaps) 308s to the matching month page, preserving link equity.
 *  - Bare `/calendar` sends visitors to the current month. That one is a
 *    temporary redirect on purpose: the target changes every month, so a
 *    permanent redirect would poison caches with a stale destination.
 */
export default async function CalendarIndexPage(
  { searchParams }: { searchParams: Promise<{ m?: string }> }
) {
  const { m } = await searchParams;

  if (isValidMonthParam(m)) {
    permanentRedirect(`/calendar/${m}`);
  }

  const now = getBangkokNow();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  redirect(`/calendar/${currentYearMonth}`);
}
