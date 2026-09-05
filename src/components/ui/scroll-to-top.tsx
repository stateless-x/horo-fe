'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

/** Roughly one viewport of scrolling before the button is worth offering. */
const SHOW_AFTER_PX = 600;

/**
 * Back-to-top control, mounted once in the root layout so it serves every page.
 *
 * Readings are long-form Thai text — the chart, daily and compatibility pages
 * all run well past a screen — so returning to the top otherwise means a long
 * manual scroll. Appears only once the page is actually deep enough to need it.
 *
 * Colors come from semantic tokens, so it follows the light/dark toggle rather
 * than hardcoding either mood (DESIGN.md: never hardcode palette hex).
 * Sits at z-40, below the cookie banner (z-50) and modals, so it can never
 * cover a consent or share action.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  // The cookie banner is fixed to the bottom edge at z-50 and would otherwise
  // sit on top of this button. Measure it instead of hardcoding an offset, so
  // the button drops back down the moment consent is answered.
  const [bannerHeight, setBannerHeight] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);

    onScroll(); // a restored scroll position should show the button immediately
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const measure = () => {
      const banner = document.querySelector<HTMLElement>('[data-cookie-banner]');
      setBannerHeight(banner ? banner.offsetHeight : 0);
    };

    measure();
    const observer = new MutationObserver(measure);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="กลับขึ้นด้านบน"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
          style={bannerHeight ? { marginBottom: bannerHeight } : undefined}
          // Lift is colored, never gray (DESIGN.md Glow-Not-Shadow Rule):
          // a purple-tinted shadow in light, an accent glow in dark.
          className="fixed bottom-6 right-4 z-40 flex size-11 items-center justify-center rounded-full border border-edge bg-surface text-inkMuted shadow-lg shadow-accent/15 backdrop-blur transition-colors hover:border-accent/50 hover:bg-surface2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright focus-visible:ring-offset-2 focus-visible:ring-offset-ground dark:shadow-accent/30 sm:bottom-8 sm:right-8"
        >
          <ArrowUp className="size-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
