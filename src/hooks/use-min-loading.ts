'use client';

import { useEffect, useRef, useState } from 'react';

/** Floor on how long a loading screen stays up, even on a cache hit. */
export const MIN_LOADING_MS = 3_000;

/**
 * True while `loading` is true, and for at least `ms` after each time it
 * turns true, even if it flips back sooner.
 *
 * The loading screens carry rotating copy and one sponsored card, and a
 * cached response can resolve in well under a second, which would never let
 * either be seen. The floor is deliberate product behaviour, not a fix for
 * slowness: a real wait is unaffected, only a near-instant one is stretched.
 *
 * The floor restarts on every false-to-true edge (compatibility starts
 * calculating long after mount), and the timer is NOT cleared when loading
 * ends, otherwise a fast response would leave the floor stuck on.
 */
export function useMinLoading(loading: boolean, ms: number = MIN_LOADING_MS): boolean {
  const [holding, setHolding] = useState(loading);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading) return;
    setHolding(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setHolding(false);
      timerRef.current = null;
    }, ms);
  }, [loading, ms]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return loading || holding;
}
