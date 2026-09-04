'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu, X, Sparkles, Sun, Moon, LogIn } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { SITE_SECTIONS } from '@/lib/site-sections';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const NAV_LINKS = SITE_SECTIONS;

const LINK_REST = 'text-inkMuted hover:text-ink hover:bg-edgeSoft';
const LINK_ACTIVE = 'bg-accent/15 text-accentBright';

export function PublicNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
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

  // Same destination for both the CTA and the "ดูดวงวันนี้" nav link:
  // logged in goes straight to today's reading, logged out goes to login,
  // which redirects to /dashboard/today after auth.
  const todayHref = session ? '/dashboard/today' : '/login';
  const ctaLabel = session ? 'ดูดวงวันนี้' : 'เข้าสู่ระบบ';

  return (
    <header ref={headerRef} className="border-b border-edge sticky top-0 z-20 backdrop-blur bg-ground/80">
      {/* Main row — one row at every breakpoint, ~56px.
          Structure: brand + links grouped LEFT, actions pushed right — no
          orphaned link floating in the middle of the bar. */}
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        {/* Brand */}
        <Link href="/" className="font-heading font-semibold text-accentBright text-xl shrink-0 leading-none">
          สายมู
        </Link>

        {/* Inline links — desktop/tablet, beside the brand. Text only; the
            active route is an underline anchored to the bar, not a pill. */}
        <nav className="hidden md:flex items-center gap-1 h-full">
          <Link
            href={todayHref}
            className={`flex items-center h-full px-3 font-thai text-sm border-b-2 -mb-px transition-colors ${
              pathname === '/dashboard/today'
                ? 'border-accent text-ink font-medium'
                : 'border-transparent text-inkMuted hover:text-ink'
            }`}
          >
            ดูดวงวันนี้
          </Link>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center h-full px-3 font-thai text-sm border-b-2 -mb-px transition-colors ${
                pathname === href
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

          {/* CTA — desktop/tablet only; on mobile everything lives in the drawer */}
          {session ? (
            <Link
              href={todayHref}
              className="hidden md:inline-flex shrink-0 whitespace-nowrap px-4 py-2 bg-accent hover:bg-accentBright text-accentInk font-heading text-sm font-medium rounded-lg transition-colors shadow-md shadow-accent/20 dark:shadow-accent/30"
            >
              {ctaLabel}
            </Link>
          ) : (
            <Link
              href={todayHref}
              className="hidden md:inline-flex shrink-0 whitespace-nowrap px-4 py-2 border-2 border-accentBright/60 text-accentBright hover:bg-accentBright/10 dark:hover:bg-accentBright/15 hover:text-ink font-heading text-sm font-medium rounded-lg transition-colors"
            >
              {ctaLabel}
            </Link>
          )}

          {/* Hamburger — mobile only */}
          <button
            type="button"
            aria-label={drawerOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={drawerOpen}
            aria-controls="public-nav-drawer"
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
        id="public-nav-drawer"
        aria-hidden={!drawerOpen}
        initial={false}
        animate={{
          height: drawerOpen ? 'auto' : 0,
          opacity: drawerOpen ? 1 : 0,
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeInOut' }}
        className="md:hidden overflow-hidden border-b border-edge bg-ground/95 backdrop-blur"
      >
        <nav className="max-w-5xl mx-auto px-4 py-2 flex flex-col">
          <Link
            href={todayHref}
            className={`flex items-center gap-2 w-full min-h-[44px] px-3 rounded-lg font-oracle text-sm transition-colors ${
              pathname === '/dashboard/today' ? LINK_ACTIVE : LINK_REST
            }`}
          >
            <Sparkles className="w-4 h-4" />
            ดูดวงวันนี้
          </Link>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 w-full min-h-[44px] px-3 rounded-lg font-oracle text-sm transition-colors ${
                pathname === href ? LINK_ACTIVE : LINK_REST
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          {!session && (
            <Link
              href="/login"
              className={`flex items-center gap-2 w-full min-h-[44px] px-3 rounded-lg font-oracle text-sm transition-colors ${
                pathname === '/login' ? LINK_ACTIVE : LINK_REST
              }`}
            >
              <LogIn className="w-4 h-4" />
              เข้าสู่ระบบ
            </Link>
          )}

          {/* Theme toggle — icon-only; the toggle's mobile home since the bar
              hides <ThemeToggle /> below md. Stable placeholder until mounted
              so SSR markup never disagrees with the resolved theme. */}
          <div className="mt-2 pt-2 border-t border-edge">
            <button
              type="button"
              aria-label="สลับโหมดสี"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-11 h-11 flex items-center justify-center rounded-lg text-inkMuted hover:text-ink hover:bg-edgeSoft transition-colors touch-manipulation"
            >
              {mounted ? (
                isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />
              ) : (
                <span className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </nav>
      </motion.div>
    </header>
  );
}
