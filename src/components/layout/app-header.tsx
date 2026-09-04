'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu, X, Settings, Sun, Moon, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import { SYSTEMS, type DashboardTab } from '@/lib/systems';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Settings is dashboard chrome, not a fortune-telling system, so it isn't
// part of the systems registry — it's appended here as a fixed last tab.
const SETTINGS_TAB: DashboardTab = { key: 'settings', label: 'ตั้งค่า', href: '/dashboard/settings', icon: Settings };

const NAV_TABS: DashboardTab[] = [
  ...SYSTEMS.filter((system) => system.enabled).flatMap((system) => system.dashboardTabs),
  SETTINGS_TAB,
];

const LINK_REST = 'text-inkMuted hover:text-ink hover:bg-edgeSoft';
const LINK_ACTIVE = 'bg-accent/15 text-accentBright';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme !== 'light';

  // Close on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  // Close on outside tap — pointerdown so it beats the trigger's own click,
  // guarded so tapping the trigger itself doesn't close-then-reopen
  useEffect(() => {
    if (!drawerOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (headerRef.current?.contains(e.target as Node)) return;
      setDrawerOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [drawerOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header ref={headerRef} className="border-b border-edge sticky top-0 z-40 h-14 backdrop-blur bg-ground/80">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2 font-heading text-xl font-semibold leading-none text-accentBright">
          <Image
            src="/assets/clay/little-oracle-mark-v1.webp"
            alt=""
            width={256}
            height={256}
            sizes="32px"
            priority
            className="h-8 w-8 object-contain"
          />
          <span>สายมู</span>
        </Link>

        {/* Inline links — desktop/tablet, beside the brand. Active route is
            an underline anchored to the bar, matching public-nav. */}
        <nav className="hidden md:flex items-center gap-1 h-full">
          {NAV_TABS.map(({ key, href, label }) => (
            <Link
              key={key}
              href={href}
              className={`flex items-center h-full px-3 font-thai text-sm border-b-2 -mb-px transition-colors ${
                pathname.startsWith(href)
                  ? 'border-accent text-ink font-medium'
                  : 'border-transparent text-inkMuted hover:text-ink'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            aria-label={drawerOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={drawerOpen}
            aria-controls="app-header-drawer"
            onClick={() => setDrawerOpen((open) => !open)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-inkMuted hover:text-ink hover:bg-edgeSoft transition-colors touch-manipulation"
          >
            {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Drawer — mobile only, slides down under the bar. Stays mounted so
          aria-controls always references a real element; height/opacity
          animate instead of mount/unmount. */}
      <motion.div
        id="app-header-drawer"
        aria-hidden={!drawerOpen}
        initial={false}
        animate={{
          height: drawerOpen ? 'auto' : 0,
          opacity: drawerOpen ? 1 : 0,
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeInOut' }}
        className="md:hidden overflow-hidden border-b border-edge bg-ground"
      >
        <nav className="max-w-5xl mx-auto px-4 py-2 flex flex-col">
          {NAV_TABS.map(({ key, href, label, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className={`flex items-center gap-2 w-full min-h-[44px] px-3 rounded-lg font-oracle text-sm transition-colors ${
                pathname.startsWith(href) ? LINK_ACTIVE : LINK_REST
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          {/* Theme toggle row */}
          <div className="mt-2 pt-2 border-t border-edge">
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`flex items-center gap-2 w-full min-h-[44px] px-3 rounded-lg font-oracle text-sm transition-colors ${LINK_REST}`}
            >
              {mounted ? (
                isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
              ) : (
                <span className="w-4 h-4" />
              )}
              สลับโหมดสี
            </button>
          </div>

          {/* Sign out row */}
          <button
            type="button"
            onClick={handleSignOut}
            className={`flex items-center gap-2 w-full min-h-[44px] px-3 rounded-lg font-oracle text-sm transition-colors ${LINK_REST}`}
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </nav>
      </motion.div>
    </header>
  );
}
