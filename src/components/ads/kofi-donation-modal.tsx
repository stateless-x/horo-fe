'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Download, Share, ChevronDown, ChevronUp } from 'lucide-react';

const STORAGE_KEY = 'horo-kofi-donation-dismissed';
const QR_IMAGE_PATH = '/mae_manee_qr.PNG';

export function KofiDonationModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Show modal after delay if not permanently dismissed
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
            <div className="relative w-full max-w-sm pointer-events-auto">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-deepNight border border-darkPurple/50 flex items-center justify-center text-ashGray hover:text-ghostWhite hover:border-amethyst/50 transition-all duration-200"
                aria-label="ปิด"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Card */}
              <div className="bg-deepNight border border-darkPurple/50 rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-royalPurple/20 to-amethyst/10 px-6 pt-6 pb-4 text-center">
                  <span className="text-4xl" aria-hidden="true">☕✨</span>
                  <h2 className="font-heading text-lg font-semibold text-ghostWhite mt-2">
                    ซื้อกาแฟให้พี่ภูสักแก้ว
                  </h2>
                  <p className="font-thai text-sm text-ashGray mt-2 leading-relaxed">
                    ดูดวงฟรีไม่อั้น ไม่มีกั๊ก
                  </p>
                  <p className="font-thai text-sm text-lavender mt-1 leading-relaxed">
                    หากชอบใจ ฝากสนับสนุนค่ากาแฟได้เลยนะครับ <Heart className="inline w-3.5 h-3.5 text-pink-400" />
                  </p>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 pt-4 space-y-4">
                  {/* PromptPay toggle button - Ko-fi style */}
                  <button
                    onClick={() => setShowQr((v) => !v)}
                    className="w-full flex items-center justify-center gap-2 font-heading text-sm font-medium bg-[#FF5E5B] hover:bg-[#ff4744] text-white rounded-xl py-3 px-4 transition-all duration-200 shadow-md shadow-[#FF5E5B]/30 hover:shadow-lg hover:shadow-[#FF5E5B]/40"
                  >
                    <span>☕ สนับสนุนผ่าน PromptPay</span>
                    {showQr ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* PromptPay QR */}
                  <AnimatePresence>
                    {showQr && (
                      <motion.div
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
                            className="flex items-center justify-center gap-2 w-full max-w-[280px] font-thai text-sm bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-xl py-2.5 px-4 transition-all duration-200 shadow-md shadow-royalPurple/30"
                          >
                            <Share className="w-4 h-4 sm:hidden" />
                            <Download className="w-4 h-4 hidden sm:block" />
                            <span className="sm:hidden">แชร์/บันทึก QR</span>
                            <span className="hidden sm:inline">บันทึก QR ลงเครื่อง</span>
                          </button>

                          <img
                            src={QR_IMAGE_PATH}
                            alt="QR Code PromptPay"
                            className="w-full max-w-[280px] rounded-xl shadow-lg"
                          />

                          <p className="font-thai text-xs text-ashGray text-center">
                            บันทึกไปเปิดในแอปธนาคาร
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Dismiss forever */}
              <div className="mt-3 text-center">
                <button
                  onClick={handleDismissForever}
                  className="font-thai text-xs text-ashGray hover:text-ghostWhite transition-colors underline underline-offset-2"
                >
                  ไม่แสดงอีก
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
