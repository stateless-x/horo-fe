'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLoadingLines } from '@/features/fortune/hooks/use-loading-lines';
import { useIsIOS } from '@/hooks/use-is-ios';
import type { LoadingSurface, SponsoredLine } from '@/lib-packages/shared';

/** Slow on purpose. Long enough to actually read a full Thai sentence. */
const REGULAR_MS = 8_000;
/** A sponsored card holds longer, since it carries a link worth noticing. */
const SPONSORED_MS = 12_000;
/**
 * One sponsored card per loading session, never in slot 0 so the oracle speaks
 * first, and always within the first few slots so a typical wait actually
 * reaches it. Which sponsor shows is random too.
 */
const SPONSORED_WITHIN_SLOTS = 5;

/**
 * Surfaces that have already shown their ad during this page load. Module
 * scope on purpose: it survives React remounts (a generation retry leaves and
 * re-enters the loading state, which would otherwise draw a fresh ad) and
 * resets on a real reload, which is a new wait and may show one again.
 */
const adShownThisLoad = new Set<LoadingSurface>();

function pickAdSlot(regularCount: number): number {
  // Slot 1..min(5, regularCount). With one regular line the ad lands at slot 1.
  const span = Math.max(1, Math.min(SPONSORED_WITHIN_SLOTS, regularCount));
  return 1 + Math.floor(Math.random() * span);
}

/** Fisher-Yates. Called once per mount so lines never repeat back to back. */
function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function SponsoredCard({ line }: { line: SponsoredLine }) {
  const isIOS = useIsIOS();
  // Defaults to the web URL and swaps only once useIsIOS confirms iOS, so the
  // server HTML and the first client paint agree.
  const href = isIOS && line.iosUrl ? line.iosUrl : line.url;

  return (
    // .glass-card is DESIGN.md's card recipe (135deg wash, blur, 1px edge,
    // purple-tinted shadow in light). In the dark room the lift is a glow from
    // the accent hue, never gray (Glow-Not-Shadow Rule).
    <div
      data-sponsor={line.sponsor}
      className="glass-card relative overflow-hidden px-6 py-5 dark:shadow-lg dark:shadow-accentBright/20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accentBright/50 to-transparent"
      />

      <div className="relative flex flex-col items-center gap-3 text-center">
        {/* Thai has no case, so no uppercase or wide tracking here; a small
            muted line is the whole label. */}
        <span className="font-thai text-xs text-inkMuted">สนับสนุนโดย</span>
        <p className="max-w-[28ch] font-thai text-[15px] leading-relaxed text-ink">{line.text}</p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          // text-accent in light (7.5:1 on the tinted pill) since accentBright
          // sits at the AA edge there; accentSoft carries the dark room. The
          // arrow is the new-tab cue: the link leaves, this page stays.
          className="mt-1 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-accentBright/30 bg-accentBright/10 px-4 font-english text-sm font-medium text-accent transition-colors hover:bg-accentBright/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:text-accentSoft"
        >
          {line.label}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

interface LoadingLineProps {
  surface: LoadingSurface;
  /** Shown until the fetch returns, and whenever the pool is empty. */
  fallback: string;
}

/**
 * Rotating copy for a loading screen.
 *
 * Falls back to `fallback` whenever the fetched pool is empty, which covers
 * both the pending and the failed request. The rotation never blocks the
 * screen it decorates.
 */
export function LoadingLine({ surface, fallback }: LoadingLineProps) {
  const { lines, sponsored } = useLoadingLines(surface);
  const reduceMotion = useReducedMotion();
  const [slot, setSlot] = useState(0);

  // Shuffled once per pool. Re-shuffling on every tick would let the same line
  // land twice in a row, which is exactly what a rotation must avoid.
  const shuffled = useMemo(() => shuffle(lines), [lines]);

  const hasLines = shuffled.length > 0;

  // One ad per session: which sponsor and which slot are both drawn once, when
  // the pool arrives, and never again. After its slot passes it does not return.
  const ad = useMemo(() => {
    if (!hasLines || sponsored.length === 0 || adShownThisLoad.has(surface)) return null;
    return {
      slot: pickAdSlot(shuffled.length),
      line: sponsored[Math.floor(Math.random() * sponsored.length)]!,
    };
  }, [shuffled, sponsored, hasLines, surface]);

  const showSponsored = ad !== null && slot === ad.slot;

  // Mark the surface only once the card is actually on screen, so a remount
  // that happens before the ad's slot still gets to show it once.
  useEffect(() => {
    if (showSponsored) adShownThisLoad.add(surface);
  }, [showSponsored, surface]);

  useEffect(() => {
    if (!hasLines) return;
    const timer = setTimeout(
      () => setSlot((prev) => prev + 1),
      showSponsored ? SPONSORED_MS : REGULAR_MS
    );
    return () => clearTimeout(timer);
  }, [slot, hasLines, showSponsored]);

  // Restart the walk whenever a new pool arrives.
  useEffect(() => {
    setSlot(0);
  }, [shuffled]);

  if (!hasLines) {
    return (
      <p className="text-accentFaint font-oracle text-base md:text-lg text-center">
        {fallback}
      </p>
    );
  }

  // Slots after the ad shift back by one so no regular line is skipped.
  const regularIndex = (ad && slot > ad.slot ? slot - 1 : slot) % shuffled.length;

  const content = showSponsored ? (
    <SponsoredCard line={ad.line} />
  ) : (
    <p className="text-accentFaint font-oracle text-base md:text-lg text-center">
      {shuffled[regularIndex]}
    </p>
  );

  if (reduceMotion) {
    return <div key={slot}>{content}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slot}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
