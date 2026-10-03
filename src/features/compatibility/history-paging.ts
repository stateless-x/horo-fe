import type { HistoryItem } from '@/features/compatibility/relationship-config';

/** Rows per page on the full history route. */
export const HISTORY_PAGE_SIZE = 20;
/** Rows the compatibility dashboard shows before linking to the full history. */
export const HISTORY_PREVIEW_LIMIT = 3;

/**
 * The history endpoint pages by cursor only, so page N is reachable once pages 1..N-1 are loaded.
 * Picks the loaded page to show for the requested 1-based `page`, clamped to the last page.
 * The page count comes from the first page's `total` (later pages send 0), corrected by what
 * is loaded: with no cursor left, the loaded pages are the whole list; with one left, at least
 * one more page exists even if `total` is stale.
 */
export function selectHistoryPage(
  pages: { data: HistoryItem[] }[],
  total: number,
  hasMore: boolean,
  page: number,
): { current: number; pageCount: number; items: HistoryItem[] | undefined; needsFetch: boolean } {
  const pageCount = hasMore
    ? Math.max(Math.ceil(total / HISTORY_PAGE_SIZE), pages.length + 1)
    : Math.max(pages.length, 1);
  const current = Math.min(page, pageCount);
  const items = pages[current - 1]?.data;
  return { current, pageCount, items, needsFetch: items === undefined };
}
