'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Download, Share, ChevronDown, ChevronUp, Coffee } from 'lucide-react';
import {
  DONATION_DISMISSED_KEY,
  DONATION_LAST_AUTO_SHOWN_KEY,
  DONATION_AUTO_DELAY_MS,
  canAutoShowDonation,
} from './donation-eligibility';

const QR_IMAGE_PATH = '/mae_manee_qr.PNG';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  showDismissForever?: boolean;
}

/**
 * Controlled donation modal - requires isOpen and onClose props
 */
export function DonationModal({ isOpen, onClose, showDismissForever = true }: DonationModalProps) {
  const [showQr, setShowQr] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Reset showQr when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowQr(false);
    }
  }, [isOpen]);

  // Focus management: remember the opener, focus the dialog, restore on close.
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  // Escape closes; Tab is contained within the dialog.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleDismissForever = useCallback(() => {
    localStorage.setItem(DONATION_DISMISSED_KEY, 'true');
    onClose();
  }, [onClose]);

  const handleSaveImage = useCallback(async () => {
    try {
      const response = await fetch(QR_IMAGE_PATH);
      const blob = await response.blob();
      const file = new File([blob], 'horo-promptpay-qr.png', { type: 'image/png' });

      // Try Web Share API first (works best on mobile)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'PromptPay QR',
          text: 'สแกนจ่ายค่ากาแฟพี่ภู',
        });
        return;
      }

      // Fallback for desktop: download via link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'horo-promptpay-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Final fallback: open image in new tab (user can long-press to save)
      window.open(QR_IMAGE_PATH, '_blank');
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-ground/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="donation-modal-title"
              className="relative w-full max-w-sm pointer-events-auto"
            >
              {/* Close button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute -top-4 -right-4 z-10 w-11 h-11 rounded-full bg-surface border border-surface2/50 flex items-center justify-center text-inkMuted hover:text-ink hover:border-accentBright/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright transition-all duration-200"
                aria-label="ปิดหน้าต่างสนับสนุน"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Card */}
              <div className="bg-surface border border-surface2/50 rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-accent/20 to-accentBright/10 px-6 pt-6 pb-4 text-center">
                  <Coffee className="w-9 h-9 mx-auto text-accentBright" aria-hidden="true" />
                  <h2 id="donation-modal-title" className="font-heading text-lg font-semibold text-ink mt-2">
                    ซื้อกาแฟให้พี่ภูสักแก้ว
                  </h2>
                  <p className="font-thai text-sm text-inkMuted mt-2 leading-relaxed">
                    ดูดวงฟรีไม่อั้น ไม่มีกั๊ก
                  </p>
                  <p className="font-thai text-sm text-lavender mt-1 leading-relaxed">
                    หากชอบใจ ฝากสนับสนุนค่ากาแฟได้เลยนะครับ <Heart className="inline w-3.5 h-3.5 text-pink-600 dark:text-pink-400" aria-hidden="true" />
                  </p>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 pt-4 space-y-4">
                  {/* PromptPay toggle button */}
                  <button
                    onClick={() => setShowQr((v) => !v)}
                    aria-expanded={showQr}
                    aria-controls="donation-qr-panel"
                    className="w-full min-h-11 flex items-center justify-center gap-2 font-heading text-sm font-medium bg-accent hover:bg-accentBright text-accentInk rounded-xl py-3 px-4 transition-all duration-200 shadow-md shadow-accent/30 dark:shadow-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
                  >
                    <Coffee className="w-4 h-4" aria-hidden="true" />
                    <span>สนับสนุนผ่าน PromptPay</span>
                    {showQr ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
                  </button>

                  {/* PromptPay QR */}
                  <AnimatePresence>
                    {showQr && (
                      <motion.div
                        id="donation-qr-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col items-center rounded-xl overflow-hidden space-y-3">
                          {/* Save/Share image button */}
                          <button
                            onClick={handleSaveImage}
                            className="flex items-center justify-center gap-2 w-full max-w-[280px] min-h-11 font-thai text-sm bg-accent hover:bg-accentBright text-accentInk rounded-xl py-2.5 px-4 transition-all duration-200 shadow-md shadow-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
                          >
                            <Share className="w-4 h-4 sm:hidden" aria-hidden="true" />
                            <Download className="w-4 h-4 hidden sm:block" aria-hidden="true" />
                            <span className="sm:hidden">แชร์/บันทึก QR</span>
                            <span className="hidden sm:inline">บันทึก QR ลงเครื่อง</span>
                          </button>

                          <img
                            src={QR_IMAGE_PATH}
                            alt="QR Code PromptPay"
                            className="w-full max-w-[280px] rounded-xl shadow-lg"
                          />

                          <p className="font-thai text-xs text-inkMuted text-center">
                            บันทึกไปเปิดในแอปธนาคาร
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Dismiss forever */}
              {showDismissForever && (
                <div className="mt-3 text-center">
                  <button
                    onClick={handleDismissForever}
                    className="min-h-11 px-2 font-thai text-xs text-inkMuted hover:text-ink transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright rounded"
                  >
                    ไม่แสดงอีก
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Auto-opening donation modal for result surfaces only.
 *
 * Rules (docs/claude-ui-correction-1.md §4):
 * - mount it only where primary value is already visible (callers gate on data);
 * - opens no earlier than 10 s after mount;
 * - at most once per seven days (timestamp in localStorage);
 * - a permanent dismiss ("ไม่แสดงอีก") always wins.
 */
export function AutoDonationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let dismissedForever: string | null = null;
    let lastAutoShown: string | null = null;
    try {
      dismissedForever = localStorage.getItem(DONATION_DISMISSED_KEY);
      lastAutoShown = localStorage.getItem(DONATION_LAST_AUTO_SHOWN_KEY);
    } catch {
      return; // storage unavailable → never auto-open
    }

    if (!canAutoShowDonation(Date.now(), dismissedForever, lastAutoShown)) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DONATION_LAST_AUTO_SHOWN_KEY, String(Date.now()));
      } catch {
        // storage write failure only affects the cooldown, still show once
      }
      setIsOpen(true);
    }, DONATION_AUTO_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DonationModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      showDismissForever
    />
  );
}
