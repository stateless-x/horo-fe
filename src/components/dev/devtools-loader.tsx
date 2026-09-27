'use client';

import dynamic from 'next/dynamic';

/**
 * Mount point for the devtools, rendered once from Providers. Client-only and
 * lazy: the panel's code is its own chunk, fetched after hydration.
 *
 * The guard must stay the literal `process.env.NODE_ENV !== 'production'`
 * test right here. Next inlines NODE_ENV at build time, and webpack drops the
 * import() in a constant-false branch, so a production build emits no
 * devtools chunk at all. Hiding the check behind a function call keeps the
 * chunk in the build (verified by grepping .next/static for "horo devtools").
 * devtools-loader.test.ts pins this.
 */
export const HoroDevtoolsLoader =
  process.env.NODE_ENV !== 'production'
    ? dynamic(() => import('./horo-devtools').then((module) => module.HoroDevtools), { ssr: false })
    : null;
