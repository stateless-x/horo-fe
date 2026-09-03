import type { Metadata } from 'next';
import { PublicNav } from '@/components/layout/public-nav';

// The (marketing) route group holds every public content section — landing,
// calendar, privacy, and future sections (tarot, shop, ...). It renders the
// shared marketing chrome (PublicNav) so pages don't each mount their own.
//
// Canonical note: the group metadata sets the homepage canonical "/". Next
// merges parent `alternates` into children unless overridden, so EVERY page
// added to this group MUST declare its own canonical in its metadata (see
// calendar/page.tsx and privacy/page.tsx). New sections: register in
// src/lib/site-sections.ts and add to sitemap.ts — see docs/adding-a-section.md.
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNav />
      {children}
    </>
  );
}
