'use client';

import { useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { trackEvent } from '@/lib/analytics';
import type { TrackedEventSurface } from '@/lib-packages/shared';

/**
 * Reports, at most once per Bangkok day, that the signed-in user opened this
 * dashboard surface. Answers "which tab do people actually open" without any
 * third-party analytics.
 *
 * A thin wrapper over trackEvent, which owns the dedup rule and the
 * fire-and-forget error handling. Kept as its own hook because "on mount, once"
 * is the pattern every page needs and a bare useEffect would repeat the
 * StrictMode guard below at every call site.
 *
 * Purely a side effect — it renders nothing, returns nothing, and never throws.
 */
export function useTrackSurfaceView(surface: TrackedEventSurface): void {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  // Guards against React StrictMode's double-invoked effect firing two requests
  // before either resolves and writes the localStorage key.
  const sentRef = useRef(false);

  useEffect(() => {
    if (!userId || sentRef.current) return;

    sentRef.current = true;
    trackEvent(userId, { event: 'surface_viewed', surface });
  }, [surface, userId]);
}
