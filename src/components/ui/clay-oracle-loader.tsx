'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';

interface ClayOracleLoaderProps {
  className?: string;
  alt?: string;
  /** Render a button that ends the animation early. */
  showSkip?: boolean;
}

const ANIMATED_SRC = '/assets/clay/little-oracle-loader-v2.webp';
const POSTER_SRC = '/assets/clay/little-oracle-loader-poster-v1.webp';

// The animation is 9 frames at 140ms. The asset itself is encoded to play once,
// but WebP loop-count handling varies between browsers, so we also swap to the
// poster ourselves once the cycle is up — that swap is what actually guarantees
// a single play. The margin covers frame-timing jitter.
const CYCLE_MS = 9 * 140;
const CYCLE_MARGIN_MS = 250;

export function ClayOracleLoader({
  className = 'h-auto w-56 sm:w-64',
  alt = '',
  showSkip = false,
}: ClayOracleLoaderProps) {
  const shouldReduceMotion = useReducedMotion();
  // useReducedMotion() is null on the server but resolved on the client's first
  // render, so choosing src from it directly causes a hydration mismatch.
  // Render the static poster on both, then swap to the animation after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Set once the animation has played its single cycle, or the user skipped it.
  const [showPoster, setShowPoster] = useState(false);
  // Flipped by the <Image> onLoad so the cycle is timed from decode, not mount:
  // the animated file is ~430KB, and a mount-anchored timer can elapse before
  // the first frame is ever painted.
  const [decoded, setDecoded] = useState(false);

  const stopAnimation = useCallback(() => setShowPoster(true), []);

  const isAnimating = mounted && shouldReduceMotion === false && !showPoster;

  // Owned by an effect rather than the onLoad handler: onLoad can fire from a
  // render where `isAnimating` is still false (mounted flips on the same tick),
  // and a guard inside the handler would then skip arming the timer for good.
  useEffect(() => {
    if (!isAnimating || !decoded) return;
    const timer = setTimeout(stopAnimation, CYCLE_MS + CYCLE_MARGIN_MS);
    return () => clearTimeout(timer);
  }, [isAnimating, decoded, stopAnimation]);

  return (
    <div className="flex flex-col items-center gap-3">
      <Image
        src={isAnimating ? ANIMATED_SRC : POSTER_SRC}
        alt={alt}
        width={1024}
        height={1024}
        sizes="(min-width: 640px) 256px, 224px"
        priority
        // Load-bearing, not an oversight: Next's optimizer re-encodes, which
        // flattens the animated WebP to a single frame. Do not remove.
        unoptimized
        onLoad={() => setDecoded(true)}
        className={className}
      />

      {showSkip && isAnimating && (
        <button
          type="button"
          onClick={stopAnimation}
          className="rounded-full px-3 py-1 font-thai text-xs text-inkMuted/70 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          ข้ามแอนิเมชัน
        </button>
      )}
    </div>
  );
}
