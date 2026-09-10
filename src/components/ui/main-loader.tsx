'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';

/**
 * Display sizes. Only `page` exists on purpose: the mascot holds each pose for
 * 500ms, so it only reads as a loader on waits long enough to show several
 * poses. Short waits — a list page fetch, a button submit — would show one
 * arbitrary pose that differs on every load, so those keep lucide's `Loader2`
 * (see compatibility-history.tsx). Add a smaller tier here only alongside a
 * faster-cadence asset.
 */
const SIZES = {
  page: {
    image: 'h-auto w-56 sm:w-64',
    frame: 'min-h-56 sm:min-h-64',
    sizes: '(min-width: 640px) 256px, 224px',
  },
} as const;

interface MainLoaderProps {
  /** Visual scale. Defaults to the full-size page loader. */
  size?: keyof typeof SIZES;
  /**
   * Accessible label announced while loading. Defaults to a generic Thai
   * loading string; pass something specific when the wait has a known subject.
   */
  label?: string;
  /** Extra classes for the outer frame. */
  className?: string;
  /** Set false to drop the accent glow behind the mascot. */
  glow?: boolean;
  /**
   * Render purely decoratively — no role/aria-live, no screen-reader label.
   * Use when the surrounding UI already announces loading status (e.g. a live
   * status message beside the loader), so assistive tech hears it once.
   */
  decorative?: boolean;
}

/**
 * The site's shared loading state — the Little Oracle mascot cycling through
 * its poses. Use this for any wait long enough to warrant a full loading
 * screen, so the mascot appears consistently everywhere instead of each
 * surface rolling its own spinner.
 */
export function MainLoader({
  size = 'page',
  label = 'กำลังโหลด...',
  className = '',
  glow = true,
  decorative = false,
}: MainLoaderProps) {
  const shouldReduceMotion = useReducedMotion();
  // useReducedMotion() is null on the server but resolved on the client's first
  // render, so choosing src from it directly causes a hydration mismatch.
  // Render the static poster on both, then swap to the animation after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const animated = mounted && shouldReduceMotion === false;
  const src = animated
    ? '/assets/clay/little-oracle-loader-v2.webp'
    : '/assets/clay/little-oracle-loader-v2-poster.webp';

  const { image, frame, sizes } = SIZES[size];

  return (
    <div
      {...(decorative
        ? { 'aria-hidden': true as const }
        : { role: 'status', 'aria-live': 'polite' as const })}
      className={`relative flex items-center justify-center ${frame} ${className}`}
    >
      {glow && (
        /* Dark-purple card behind the mascot, built in three stacked layers so
           it reads with depth instead of as one flat swatch:
             1. a solid base at --loader-stage-edge that sets the edge tone,
             2. the radial gradient lifting the centre to --loader-stage-center,
             3. a top-down highlight + inset ring for a lit upper edge.
           Sits behind the image only — the caller's text stays on the page
           background. Colors live in globals.css as --loader-stage-*; they are
           the same in both themes on purpose (the mascot's stage, not a themed
           page surface). */
        <div
          className="absolute left-1/2 top-1/2 aspect-square w-[112%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22%]"
          style={{ backgroundColor: 'var(--loader-stage-edge)' }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 46%, var(--loader-stage-center) 0%, var(--loader-stage-mid) 38%, var(--loader-stage-fade) 68%, var(--loader-stage-edge) 100%)',
            }}
          />
          {/* Light falls from above: a faint white wash down to transparent,
              then a deepening toward the base. The ring is DESIGN.md's
              white/10 card edge, applied inset so the rounded corners read as
              an edge rather than just a fill. */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-black/15 shadow-[inset_0_1px_0_theme(colors.white/10),inset_0_0_0_1px_theme(colors.white/5)]" />
        </div>
      )}
      <Image
        src={src}
        alt=""
        width={420}
        height={420}
        sizes={sizes}
        priority
        // Load-bearing, not an oversight: Next's optimizer re-encodes, which
        // flattens the animated WebP to a single frame. Do not remove.
        unoptimized
        className={`relative ${image}`}
      />
      {!decorative && <span className="sr-only">{label}</span>}
    </div>
  );
}
