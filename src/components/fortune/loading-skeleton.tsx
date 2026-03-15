'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { LoadingState } from '@/stores/fortune';

interface LoadingSkeletonProps {
  loadingState: LoadingState;
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

const MESSAGE_INTERVAL_MS = 4_000; // Rotate every 4 seconds

export function LoadingSkeleton({ loadingState }: LoadingSkeletonProps) {
  const router = useRouter();
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Rotate mystical messages
  useEffect(() => {
    if (loadingState !== 'generating-chart' && loadingState !== 'generating-narrative') return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MYSTICAL_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadingState]);

  const getLoadingMessage = useCallback(() => {
    switch (loadingState) {
      case 'saving-profile':
        return 'กำลังบันทึกข้อมูลของเจ้า...';
      case 'generating-chart':
      case 'generating-narrative':
        return MYSTICAL_MESSAGES[messageIndex];
      case 'initializing':
      default:
        return 'กำลังเตรียมการ...';
    }
  }, [loadingState, messageIndex]);

  const isGenerating = loadingState === 'generating-chart' || loadingState === 'generating-narrative';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full mx-auto flex flex-col items-center text-center space-y-8">
        {/* Mystical orb animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Outer glow ring */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 rounded-full bg-amethyst/20 blur-xl"
          />
          {/* Spinning ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-royalPurple/30 border-t-amethyst border-r-royalPurple"
          />
          {/* Inner orb */}
          <motion.div
            animate={{
              scale: [0.9, 1.1, 0.9],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-amethyst/60 to-royalPurple/40 backdrop-blur-sm" />
          </motion.div>
          {/* Center star */}
          <motion.div
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl"
          >
            ✦
          </motion.div>
        </motion.div>

        {/* Status message with crossfade */}
        <div className="min-h-[3.5rem] flex items-center justify-center">
          {isTimedOut ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-paleOrchid font-oracle text-base md:text-lg"
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
                className="text-paleOrchid font-oracle text-base md:text-lg"
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
            className="text-ashGray/60 text-xs md:text-sm"
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
                className="px-6 py-2 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-lg transition-colors font-heading"
              >
                ลองใหม่
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 border border-royalPurple/50 text-ashGray hover:text-ghostWhite rounded-lg transition-colors font-heading"
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
