'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  /** AdSense ad slot ID from your AdSense dashboard */
  slot: string;
  /** Ad format — 'auto' adapts to container width (recommended) */
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  /** Label shown above the ad. Default: 'โฆษณา' */
  label?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * A single Google AdSense display ad unit.
 *
 * Usage:
 *   <AdUnit slot="1234567890" format="auto" />
 *
 * Get slot IDs from: https://www.google.com/adsense → Ads → By ad unit
 *
 * Notes:
 * - Only renders in production (NODE_ENV === 'production') to avoid
 *   AdSense "No slot size for availableWidth=0" errors during development.
 * - Do NOT place on /fortune or /login pages.
 */
export function AdUnit({ slot, format = 'auto', label = 'โฆษณา', className = '' }: AdUnitProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    // Skip in development — AdUnit renders no <ins> below, so pushing here
    // would call adsbygoogle.push() with no unfilled slot to fill.
    if (isDev) return;
    if (pushed.current) return;
    // Guard against AdSense having already filled this exact <ins> (e.g.
    // Auto ads claiming it before our manual push runs) — pushing again
    // on an already-filled element is what throws "already have ads in them".
    if (ref.current?.dataset.adsbygoogleStatus) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded (e.g. blocked by ad blocker) — fail silently
    }
  }, [isDev]);

  // Skip in development — AdSense rejects zero-size slots in dev
  if (isDev) {
    return (
      <div className={`my-4 ${className}`}>
        <p className="text-xs text-inkMuted/40 text-center font-oracle">
          [AdSense slot {slot} — visible in production only]
        </p>
      </div>
    );
  }

  return (
    <div className={`my-4 ${className}`}>
      <p className="text-xs text-inkMuted/50 text-center font-oracle mb-1">{label}</p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7565287726351560"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
