import type { FortuneCategoryKey } from '@/lib-packages/shared';

/** One system's read on the visitor, shown as a chip on the teaser card. */
export interface TeaserTraitChip {
  system: 'thai' | 'bazi' | 'mbti';
  label: string;
  trait: string;
}

/** Today's four category scores, identical to what /dashboard/today shows. */
export interface TeaserScores {
  date: string;
  love: number;
  career: number;
  finance: number;
  health: number;
}

/**
 * The onboarding teaser API response. `contentVersion: 2` is the marker that
 * separates this shape from the legacy one — `personality` and `todaySnippet`
 * are kept on the type (and may still arrive on the wire) but are no longer
 * rendered; the v2 card is built from `threeWay`, `reading`, `traitChips`,
 * and `scores` instead.
 */
export interface TeaserResult {
  contentVersion: 2;
  elementType: string;
  luckyColor?: string;
  luckyNumber?: number;
  personality?: string;
  todaySnippet?: string;
  threeWay: string;
  reading: string;
  focusArea: FortuneCategoryKey;
  traitChips: TeaserTraitChip[];
  scores: TeaserScores;
}

/**
 * Narrows a stored or freshly-fetched value to a complete v2 TeaserResult, or
 * null when it is missing, malformed, or a pre-v2 cache entry.
 *
 * Anything that fails this check is treated as "no teaser yet" by callers:
 * a stale localStorage entry triggers a fresh generation instead of crashing
 * on a v2-only field, and a non-v2 API response (an old backend deploy) is
 * treated as a failure rather than rendered half-built.
 */
export function completedTeaser(value: unknown): TeaserResult | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<TeaserResult>;

  if (candidate.contentVersion !== 2) return null;
  if (!candidate.elementType) return null;
  if (!candidate.threeWay) return null;
  if (!candidate.reading) return null;
  if (!candidate.focusArea) return null;
  if (!Array.isArray(candidate.traitChips) || candidate.traitChips.length === 0) return null;
  if (!candidate.scores || typeof candidate.scores !== 'object') return null;

  return candidate as TeaserResult;
}
