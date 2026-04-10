'use client';

import Script from 'next/script';

const PUBLISHER_ID = 'ca-pub-7565287726351560';

/**
 * Loads the Google AdSense script once per page load.
 * Place this in layout.tsx — it runs after the page is interactive
 * so it never blocks rendering.
 *
 * AdSense auto-ads are configured in the AdSense dashboard.
 * Manual ad units are placed via <AdUnit> components.
 */
export function AdSenseScript() {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
