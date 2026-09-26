import { DAILY_CATEGORY_KEYS, type FortuneCategoryKey } from '@/lib/fortune-category-config';

/** localStorage key. Separate from the onboarding store so it survives both
 * `reset()` (fired right after signup) and the OAuth redirect, which the
 * store's own persisted state does not need to. */
const STORAGE_KEY = 'horo-continue-focus';

/** How long the "pick up where you left off" pointer stays valid. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type DailyCategoryKey = (typeof DAILY_CATEGORY_KEYS)[number];

interface ContinueFocus {
  area: DailyCategoryKey;
  setAt: string;
}

function isDailyCategoryKey(value: unknown): value is DailyCategoryKey {
  return typeof value === 'string' && (DAILY_CATEGORY_KEYS as readonly string[]).includes(value);
}

/** Records the teaser's focus area so /dashboard/today can resume there after signup. */
export function setContinueFocus(area: FortuneCategoryKey): void {
  if (!isDailyCategoryKey(area)) return;
  try {
    const value: ContinueFocus = { area, setAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private mode / storage disabled — continuity is best-effort.
  }
}

/**
 * Reads the pending focus area if one exists and is still fresh (< 24h), and
 * always clears the key afterward — the pointer is meant to fire once, so a
 * malformed or stale entry is discarded exactly like a valid one that was
 * just consumed.
 */
export function consumeContinueFocus(): DailyCategoryKey | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    localStorage.removeItem(STORAGE_KEY);

    const parsed = JSON.parse(raw) as Partial<ContinueFocus>;
    if (!isDailyCategoryKey(parsed.area) || typeof parsed.setAt !== 'string') return null;

    const setAt = new Date(parsed.setAt).getTime();
    if (!Number.isFinite(setAt) || Date.now() - setAt >= MAX_AGE_MS) return null;

    return parsed.area;
  } catch {
    return null;
  }
}
