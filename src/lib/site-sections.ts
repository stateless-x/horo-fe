import { Calendar, type LucideIcon } from 'lucide-react';

/**
 * Registry of public site sections.
 *
 * This is the ONLY place a new public section is registered. To add one
 * (e.g. tarot, shop):
 *   1. Create the route under src/app/(marketing)/<slug>/ with its own
 *      metadata (title, description, canonical — the group layout's
 *      canonical must be overridden).
 *   2. Append an entry here. The marketing nav renders from this list.
 *   3. Add the route to src/app/sitemap.ts.
 */
export interface SiteSection {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const SITE_SECTIONS: SiteSection[] = [
  { href: '/calendar', label: 'ปฏิทินไทย', icon: Calendar },
  // Future sections slot in here, e.g.:
  // { href: '/tarot', label: 'ไพ่ทาโรต์', icon: Sparkles },
  // { href: '/shop', label: 'ร้านมงคล', icon: Gem },
];
