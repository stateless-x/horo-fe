'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { SITE_SECTIONS } from '@/lib/site-sections';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const NAV_LINKS = SITE_SECTIONS;

const LINK_BASE =
  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-oracle text-sm transition-colors';
const LINK_REST = 'text-inkMuted hover:text-ink hover:bg-edgeSoft';
const LINK_ACTIVE = 'bg-accent/15 text-accentBright';

export function PublicNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const shouldReduceMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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

  const ctaHref = session ? '/dashboard' : '/fortune';
  const ctaLabel = session ? 'กลับสู่ดวงของเจ้า →' : 'เริ่มดูดวงฟรี →';

  return (
    <header ref={headerRef} className="border-b border-edge sticky top-0 z-20 backdrop-blur bg-ground/80">
      {/* Main row — one row at every breakpoint, ~56px */}
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="font-heading text-accentBright text-lg shrink-0">
          สายมู
        </Link>

        {/* Inline links — desktop/tablet only */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${LINK_BASE} ${pathname === href ? LINK_ACTIVE : LINK_REST}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Spacer pushes trailing controls to the right on mobile */}
        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          <Link
            href={ctaHref}
            className="shrink-0 whitespace-nowrap px-3 md:px-4 py-2 bg-accent hover:bg-accentBright text-accentInk font-heading text-xs md:text-sm rounded-lg transition-colors shadow-md shadow-accent/20 dark:shadow-accent/30"
          >
            {ctaLabel}
          </Link>

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
              เข้าสู่ระบบ
            </Link>
          )}
        </nav>
      </motion.div>
    </header>
  );
}
