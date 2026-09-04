import { Sun, Orbit, Heart, type LucideIcon } from 'lucide-react';

/**
 * Registry of fortune-telling systems (product-side, not marketing).
 *
 * This is the ONLY place a system's dashboard tabs are registered. To add a
 * new system (e.g. tarot going live):
 *   1. Build its feature code under src/features/<id>/ (see
 *      src/features/tarot/README.md for the placeholder).
 *   2. Add its route(s) under src/app/dashboard/<id>/.
 *   3. Set `enabled: true` and fill in `dashboardTabs` below. The bottom
 *      nav (dashboard-nav-bar.tsx) renders from this list — nothing else
 *      to touch.
 *
 * See docs/adding-a-system.md for the full cross-repo recipe.
 */
export interface DashboardTab {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface FortuneSystem {
  id: string;
  enabled: boolean;
  dashboardRoute: string;
  dashboardTabs: DashboardTab[];
}

export const SYSTEMS: FortuneSystem[] = [
  {
    id: 'fortune',
    enabled: true,
    dashboardRoute: '/dashboard/fortune',
    dashboardTabs: [
      { key: 'fortune', label: 'ดวงชะตา', href: '/dashboard/fortune', icon: Orbit },
      { key: 'today', label: 'ดวงวันนี้', href: '/dashboard/today', icon: Sun },
      { key: 'compatibility', label: 'ดวงคู่', href: '/dashboard/compatibility', icon: Heart },
    ],
  },
  {
    id: 'tarot',
    enabled: false,
    dashboardRoute: '/dashboard/tarot',
    dashboardTabs: [],
  },
];
