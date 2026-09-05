'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLoadingLines } from '@/features/fortune/hooks/use-loading-lines';
import { useIsIOS } from '@/hooks/use-is-ios';
import type { LoadingSurface, SponsoredLine } from '@/lib-packages/shared';

/** Slow on purpose. Long enough to actually read a full Thai sentence. */
const REGULAR_MS = 8_000;
/** A sponsored card holds longer, since it carries a link worth noticing. */
const SPONSORED_MS = 12_000;
/** Every 6th slot is sponsored. Slot 0 never is, so the oracle speaks first. */
const SPONSORED_EVERY = 6;

function isSponsoredSlot(slot: number): boolean {
  return slot > 0 && slot % SPONSORED_EVERY === 0;
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
    <div
      data-sponsor={line.sponsor}
      className="relative overflow-hidden rounded-2xl border border-edge bg-surface px-5 py-4 shadow-lg shadow-accent/10 dark:shadow-accent/25"
    >
      {/* Faint wash plus a hairline of accent along the top edge. The lift is
          colored, never gray (DESIGN.md Glow-Not-Shadow Rule). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.06] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accentBright/40 to-transparent"
      />

      <div className="relative flex flex-col items-center gap-2 text-center">
        <span className="text-[10px] uppercase tracking-[0.18em] text-inkMuted">
          สนับสนุนโดย
        </span>
        <p className="font-thai text-sm text-ink">{line.text}</p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="rounded-full border border-accentBright/30 bg-accentBright/10 px-3 py-1 font-english text-sm text-accentBright transition-colors hover:bg-accentBright/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
        >
          {line.label}
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

  useEffect(() => {
    if (!hasLines) return;
    const isSponsored = isSponsoredSlot(slot) && sponsored.length > 0;
    const timer = setTimeout(
      () => setSlot((prev) => prev + 1),
      isSponsored ? SPONSORED_MS : REGULAR_MS
    );
    return () => clearTimeout(timer);
  }, [slot, hasLines, sponsored.length]);

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

  const showSponsored = isSponsoredSlot(slot) && sponsored.length > 0;
  // Count how many sponsored slots have already passed, so the sponsors cycle
  // in order instead of repeating the first one.
  const sponsoredIndex = (Math.floor(slot / SPONSORED_EVERY) - 1) % sponsored.length;
  const regularIndex = (slot - Math.floor(slot / SPONSORED_EVERY)) % shuffled.length;

  const content = showSponsored ? (
    <SponsoredCard line={sponsored[sponsoredIndex]!} />
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
