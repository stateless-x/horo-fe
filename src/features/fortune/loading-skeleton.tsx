'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { LoadingState } from '@/stores/fortune';
import { ClayOracleLoader } from '@/components/ui/clay-oracle-loader';

interface LoadingSkeletonProps {
  /** Loading state from the fortune store (chart flow) */
  loadingState?: LoadingState;
  /** Simple loading flag — use when not using the fortune store (e.g. daily page) */
  isLoading?: boolean;
}

const TIMEOUT_MS = 30_000; // 30 seconds before showing escape hatch

/** Rotating mystical messages shown while generating */
const MYSTICAL_MESSAGES = [
  'จงภาวนาเพื่อให้มีโชคดีตลอดทั้งปี...',
  'ดาวกำลังเรียงตัว...',
  'กำลังอ่านพลังธาตุของเจ้า...',
  'เสาสี่ที่กำลังเผยความลับ...',
  'ดวงชะตากำลังปรากฏ...',
  'พลังจักรวาลกำลังส่องนำทาง...',
];

const DAILY_MESSAGES = [
  'กำลังเปิดดวงวันนี้ของเจ้า...',
  'ดาวกำลังเรียงตัว...',
  'พลังจักรวาลกำลังส่องนำทาง...',
  'กำลังอ่านพลังธาตุของเจ้า...',
];

const MESSAGE_INTERVAL_MS = 4_000; // Rotate every 4 seconds

export function LoadingSkeleton({ loadingState, isLoading }: LoadingSkeletonProps) {
  const router = useRouter();
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  // Determine mode: daily (simple) vs chart (store-driven)
  const isDailyMode = isLoading !== undefined;
  const isActive = isDailyMode ? isLoading : loadingState !== 'complete';
  const messages = isDailyMode ? DAILY_MESSAGES : MYSTICAL_MESSAGES;

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => setIsTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isActive]);

  // Reset timeout when loading finishes
  useEffect(() => {
    if (!isActive) setIsTimedOut(false);
  }, [isActive]);

  // Rotate mystical messages
  useEffect(() => {
    if (!isActive) return;
    // For chart mode, only rotate during generation states
    if (!isDailyMode && loadingState !== 'generating-chart' && loadingState !== 'generating-narrative') return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isActive, isDailyMode, loadingState, messages.length]);

  const getLoadingMessage = useCallback(() => {
    if (isDailyMode) {
      return messages[messageIndex];
    }
    switch (loadingState) {
      case 'saving-profile':
        return 'กำลังบันทึกข้อมูลของเจ้า...';
      case 'generating-chart':
      case 'generating-narrative':
        return messages[messageIndex];
      case 'initializing':
      default:
        return 'กำลังเตรียมการ...';
    }
  }, [isDailyMode, loadingState, messageIndex, messages]);

  const isGenerating = isDailyMode
    ? isLoading
    : loadingState === 'generating-chart' || loadingState === 'generating-narrative';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full mx-auto flex flex-col items-center text-center space-y-8">
        {/* The generated clay sequence is decorative; the live message below
            carries the loading status for assistive technology. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative flex min-h-56 items-center justify-center sm:min-h-64"
        >
          <div className="absolute inset-1/4 rounded-full bg-accentBright/15 blur-3xl" aria-hidden="true" />
          <ClayOracleLoader showSkip />
        </motion.div>

        {/* Status message with crossfade */}
        <div className="min-h-[3.5rem] flex items-center justify-center">
          {isTimedOut ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-accentFaint font-oracle text-base md:text-lg"
            >
              ดูเหมือนจะใช้เวลานานกว่าปกติ...
            </motion.p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.p
                key={getLoadingMessage()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-accentFaint font-oracle text-base md:text-lg"
              >
                {getLoadingMessage()}
              </motion.p>
            </AnimatePresence>
          )}
        </div>

        {/* Progress hint for longer waits */}
        {isGenerating && !isTimedOut && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-inkMuted/60 text-xs md:text-sm"
          >
            อาจใช้เวลาสักครู่ในการวิเคราะห์ดวงชะตา
          </motion.p>
        )}

        {/* Escape hatch after timeout */}
        {isTimedOut && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-accent hover:bg-accentBright text-accentInk rounded-lg transition-colors font-heading"
              >
                ลองใหม่
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 border border-accent/50 text-inkMuted hover:text-ink rounded-lg transition-colors font-heading"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
