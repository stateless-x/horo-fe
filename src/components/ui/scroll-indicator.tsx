'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  /** How far user needs to scroll before hiding (in pixels). Default: 100 */
  hideAfterScroll?: number;
  /** Delay before showing indicator (in ms). Default: 1500 */
  showDelay?: number;
}

/**
 * Scroll Indicator
 *
 * A floating bounce arrow at the bottom center of viewport that encourages
 * users to scroll down. Automatically hides after user scrolls.
 *
 * Usage:
 * ```tsx
 * <ScrollIndicator />
 * ```
 */
export function ScrollIndicator({
  hideAfterScroll = 100,
  showDelay = 1500
}: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    // Show indicator after delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);

    // Hide indicator after user scrolls
    const handleScroll = () => {
      if (window.scrollY > hideAfterScroll) {
        setHasScrolled(true);
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(showTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hideAfterScroll, showDelay]);

  // Don't show again after user has scrolled
  if (hasScrolled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        >
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex flex-col items-center gap-2"
          >
            {/* Hint text */}
            <p className="text-lavenderGlow text-sm font-thai">
              เลื่อนดูรายละเอียด
            </p>

            {/* Animated arrow */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royalPurple to-amethyst flex items-center justify-center shadow-[0_0_20px_rgba(161,106,203,0.5)]">
              <ChevronDown className="w-6 h-6 text-ghostWhite" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
