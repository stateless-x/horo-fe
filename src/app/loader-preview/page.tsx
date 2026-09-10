/**
 * TEMPORARY dev-only preview of the shared MainLoader — localhost only.
 *
 * This is a server component on purpose: `notFound()` is only authoritative on
 * the server, so gating here genuinely 404s the route in a production build.
 * The same check inside a client component does not — NODE_ENV is inlined into
 * the browser bundle and the route still serves a 200 shell.
 *
 * `force-dynamic` keeps Next from prerendering it at build time, so the guard
 * runs per request rather than being baked into a static page.
 *
 * Delete the whole `src/app/loader-preview/` directory when you're done.
 */

import { notFound } from 'next/navigation';
import { LoaderPreview } from './preview-client';

export const dynamic = 'force-dynamic';

export default function LoaderPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <LoaderPreview />;
}
