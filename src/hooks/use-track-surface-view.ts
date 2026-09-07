'use client';

import { useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { api } from '@/lib/api';
import { getTodayBangkokString, type TrackedSurface } from '@/lib-packages/shared';

/** localStorage key holding the last Bangkok date this surface was reported. */
function storageKey(surface: TrackedSurface, userId: string): string {
  return `horo-surface-view:${surface}:${userId}`;
}

/**
 * Reports, at most once per Bangkok day, that the signed-in user opened this
 * dashboard surface. Answers "which tab do people actually open" without any
 * third-party analytics.
 *
 * Two layers of dedup keep this off the hot path: localStorage stops a repeat
 * request on this device, and a unique index on (user, surface, day) makes a
 * request that slips through a no-op insert. So the ceiling is one write per
 * user per surface per day no matter how often the page is opened.
 *
 * Purely a side effect — it renders nothing, returns nothing, and never throws.
 * A failure here must never break a fortune page, so errors are swallowed after
 * a console.warn and simply retried on the next mount.
 */
export function useTrackSurfaceView(surface: TrackedSurface): void {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  // Guards against React StrictMode's double-invoked effect firing two requests
  // before either resolves and writes the localStorage key.
  const sentRef = useRef(false);

  useEffect(() => {
    if (!userId || sentRef.current) return;

    const key = storageKey(surface, userId);
    const today = getTodayBangkokString();

    try {
      if (localStorage.getItem(key) === today) return;
    } catch {
      // Private mode / storage disabled: fall through and let the DB dedup.
    }

    sentRef.current = true;

    api
      .post('/api/analytics/view', { surface })
      .then(() => {
        // Written on any success, including `{ recorded: false }` — the server
        // already had today's row, so this device should stop asking too.
        try {
          localStorage.setItem(key, today);
        } catch {
          // Nothing to do; the DB stays the source of truth.
        }
      })
      .catch((error) => {
        // Not marked as sent-today, so a later mount retries. Deliberately not
        // surfaced to the user: analytics must never interrupt a reading.
        console.warn('[Analytics] Failed to record surface view:', error);
        sentRef.current = false;
      });
  }, [surface, userId]);
}
