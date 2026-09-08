'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { useTrackEvent } from '@/lib/analytics';
import type { TrackedCta, TrackedEventSurface } from '@/lib-packages/shared';

interface TrackedCtaLinkProps {
  /** Which button, from the closed TRACKED_CTAS list in lib/shared. */
  cta: TrackedCta;
  /** The surface the reader is clicking from, not the destination. */
  surface: TrackedEventSurface;
  href: string;
  className?: string;
  children: ReactNode;
}

/**
 * A Next <Link> that records a `cta_clicked` product event as it navigates.
 *
 * Why a component and not a bare onClick at each call site: the (cta, surface)
 * pair is the whole payload, and a hand-written handler per button is where one
 * eventually ships with the wrong surface or a stale id. Adding a tracked CTA is
 * now an entry in TRACKED_CTAS plus this wrapper.
 *
 * It costs nothing on the critical path:
 *   - The event is fired and forgotten. `trackEvent` never awaits, never throws,
 *     and never blocks navigation — Next starts the client-side transition on
 *     the same click regardless of what the request does.
 *   - The request carries `keepalive`, so a click that leaves the SPA still
 *     delivers rather than being cancelled with the old document.
 *   - No effect, no state, no timer. The only client JS added is this handler.
 *
 * A signed-out reader records nothing: useTrackEvent returns a no-op without a
 * session, and the endpoint is authenticated anyway. Anonymous CTA clicks are
 * the visitor-tracking work, not this.
 */
export function TrackedCtaLink({ cta, surface, href, className, children }: TrackedCtaLinkProps) {
  const track = useTrackEvent();

  return (
    <Link
      href={href}
      className={className}
      onClick={() => track({ event: 'cta_clicked', surface, cta })}
    >
      {children}
    </Link>
  );
}
