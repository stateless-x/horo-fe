import { SessionRedirect } from '@/components/session-redirect';
import { LandingNarrative } from '@/components/landing/landing-narrative';
import { SEOSections } from '@/components/seo/seo-sections';
import { CookieConsent } from '@/components/cookie-consent';

/**
 * Landing Page — a Server Component.
 *
 * The animated narrative (hero through closing CTA) is a Client Component
 * because it uses framer-motion and the hero video; everything else renders
 * on the server. That matters for <SEOSections />, which carries the FAQPage
 * JSON-LD: keeping it server-side means the structured data is in the
 * prerendered HTML rather than shipped as client work.
 *
 * Signed-in visitors are moved to the dashboard by <SessionRedirect />, which
 * renders nothing. The page no longer blanks itself while that resolves.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <SessionRedirect />

      <LandingNarrative />

      {/* ===== SEO Content — collapsed, crawlable ===== */}
      <SEOSections />

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
