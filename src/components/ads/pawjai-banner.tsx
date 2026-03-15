'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const STORAGE_KEY = 'horo-pawjai-ads-dismissed';
const PAWJAI_URL = 'https://pawjai.co';
const DESKTOP_IMAGE = 'https://pawjai.b-cdn.net/ads/pawjai-ads/pawjai-ads-banner-desktop.webp';
const DESKTOP_IMAGE_FALLBACK = '/pawjai-ads-banner-desktop.webp';
const MOBILE_IMAGE = 'https://pawjai.b-cdn.net/ads/pawjai-ads/pawjai-ads-banner-mobile.webp';
const MOBILE_IMAGE_FALLBACK = '/pawjai-ads-banner-mobile.webp';

export function PawjaiBanner() {
  const [isVisible, setIsVisible] = useState(false);

  // Show popup after delay if not permanently dismissed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (dismissed) return;

    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Escape key to close
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVisible(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleDismissForever = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  }, []);

  const handleCtaClick = useCallback(() => {
    window.open(PAWJAI_URL, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-voidBlack/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-lg pointer-events-auto">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-deepNight border border-darkPurple/50 flex items-center justify-center text-ashGray hover:text-ghostWhite hover:border-amethyst/50 transition-all duration-200"
                aria-label="ปิด"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Banner image - clickable */}
              <button
                onClick={handleCtaClick}
                className="block w-full rounded-2xl overflow-hidden border border-darkPurple/50 hover:border-amethyst/30 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amethyst/50"
              >
                {/* Desktop image */}
                <img
                  src={DESKTOP_IMAGE}
                  alt="Pawjai.co - ดูดวงออนไลน์"
                  className="hidden md:block w-full h-auto"
                  loading="eager"
                  onError={(e) => { e.currentTarget.src = DESKTOP_IMAGE_FALLBACK; }}
                />
                {/* Mobile image */}
                <img
                  src={MOBILE_IMAGE}
                  alt="Pawjai.co - ดูดวงออนไลน์"
                  className="block md:hidden w-full h-auto"
                  loading="eager"
                  onError={(e) => { e.currentTarget.src = MOBILE_IMAGE_FALLBACK; }}
                />
              </button>

              {/* Bottom actions */}
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={handleDismissForever}
                  className="font-thai text-xs text-ashGray hover:text-ghostWhite transition-colors underline underline-offset-2"
                >
                  ไม่แสดงอีก
                </button>

                <button
                  onClick={handleCtaClick}
                  className="font-heading text-sm font-medium bg-royalPurple text-ghostWhite px-5 py-2 rounded-xl hover:bg-amethyst shadow-md shadow-royalPurple/30 hover:shadow-lg hover:shadow-amethyst/30 transition-all duration-200"
                >
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
