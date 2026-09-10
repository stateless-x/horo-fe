'use client';

import { useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { api } from '@/lib/api';
import {
  dedupKeyFor,
  getTodayBangkokString,
  type CompatibilityFailureClass,
  type TrackedEvent,
} from '@/lib-packages/shared';

type ApiFailure = {
  status?: number;
  code?: string;
  body?: { code?: string };
};

/** Reduces request failures to a bounded analytics value; no server prose is sent. */
export function classifyCompatibilityFailure(error: unknown): CompatibilityFailureClass {
  const failure = error as ApiFailure | null;
  const status = failure?.status;
  const code = failure?.body?.code ?? failure?.code;

  if (status === 429 || code === 'RATE_LIMIT_EXCEEDED') return 'rate_limited';
  if (status === 408 || code === 'TIMEOUT') return 'timeout';
  if (status === 400 || status === 422) return 'validation';
  if (status === 401 || status === 403 || code === 'UNAUTHORIZED') return 'authentication';
  if (status === 404) return 'profile_missing';
  if (typeof status === 'number' && status >= 500) return 'server';
  if (error instanceof TypeError) return 'network';
  return 'unknown';
}

/**
 * localStorage key holding the last Bangkok date this event was reported.
 * Scoped by user so a shared device does not suppress the second person's
 * events.
 */
function storageKey(userId: string, event: TrackedEvent, dedupKey: string): string {
  return `horo-ev:${userId}:${event.event}:${dedupKey}`;
}

/**
 * Reports a bounded product event such as a page, category, CTA, or outbound
 * affiliate trigger. Answers "what do people actually use" without third-party
 * analytics.
 *
 * Deduped events (see dedupKeyFor in lib-packages/shared) fire at most once per
 * user per key per Bangkok day. Two layers enforce that: localStorage stops a
 * repeat request from this device, and a unique index on
 * (user, event, dedupKey, day) makes a request that slips through a no-op
 * insert. Events with no dedup key — every compatibility check, every share —
 * are sent each time on purpose.
 *
 * Fire-and-forget and never throws. A failure here must never break a reading,
 * so errors are swallowed after a console.warn; the key is not written, so the
 * next attempt retries.
 *
 * Sends no birth data, names, or generated prose.
 */
export function trackEvent(userId: string, event: TrackedEvent): void {
  const dedupKey = dedupKeyFor(event);
  const today = getTodayBangkokString();
  const key = dedupKey === null ? null : storageKey(userId, event, dedupKey);

  if (key) {
    try {
      if (localStorage.getItem(key) === today) return;
    } catch {
      // Private mode / storage disabled: fall through and let the DB dedup.
    }
  }

  api
    // keepalive: a CTA click starts a navigation, and without it the request is
    // cancelled mid-flight whenever that navigation leaves the SPA.
    // timeout: 5s, not the 45s POST default — nothing here is worth a hanging
    // socket, and an analytics ping that slow is already lost.
    .post('/api/analytics/event', event, { keepalive: true, timeout: 5_000 })
    .then(() => {
      if (!key) return;
      // Written on any success, including `{ recorded: false }` — the server
      // already had today's row, so this device should stop asking too.
      try {
        localStorage.setItem(key, today);
      } catch {
        // Nothing to do; the DB stays the source of truth.
      }
    })
    .catch((error) => {
      // Deliberately not surfaced to the user: analytics must never interrupt
      // a reading. Not marked as sent, so a later attempt retries.
      console.warn('[Analytics] Failed to record event:', error);
    });
}

/**
 * Returns a stable `track` bound to the signed-in user, or a no-op while the
 * session is still loading or absent.
 *
 * Stable identity matters: callers put `track` in useCallback/useEffect
 * dependency arrays, and a fresh function each render would rebuild those.
 */
export function useTrackEvent(): (event: TrackedEvent) => void {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useCallback(
    (event: TrackedEvent) => {
      if (!userId) return;
      trackEvent(userId, event);
    },
    [userId]
  );
}
