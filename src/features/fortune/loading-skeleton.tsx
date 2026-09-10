'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { LoadingState } from '@/stores/fortune';
import { MainLoader } from '@/components/ui/main-loader';
import { LoadingLine } from '@/components/ui/loading-line';

interface LoadingSkeletonProps {
  /** Loading state from the fortune store (chart flow) */
  loadingState?: LoadingState;
  /** Simple loading flag — use when not using the fortune store (e.g. daily page) */
  isLoading?: boolean;
}

// Escape-hatch delay before showing the "taking longer than usual" retry UI.
// These are tied to the backend's per-attempt LLM budgets, not arbitrary UX
// values: chart generation gets up to 180s (horo-be llm.ts chart flow) and
// daily generation up to 120s (horo-be llm.ts "Enhanced daily generation"),
// and the daily GET itself waits 130s (use-daily-fortune.ts), so the hatch
// sits just past that.
// Client fetch timeouts (use-fortune-data.ts, use-daily-fortune.ts) already
// allow that long, so the hatch must not fire before a healthy request could
// still succeed.
const CHART_TIMEOUT_MS = 150_000;
const DAILY_TIMEOUT_MS = 140_000;

// When the second-stage reassurance text kicks in for chart mode, ahead of
// the 150s hatch above.
const CHART_REASSURANCE_STAGE_MS = 30_000;

/** Rotating mystical messages shown while generating */
const MYSTICAL_MESSAGES = [
  'กำลังเตรียมคำทำนายให้คุณ...',
  'ดาวกำลังเรียงตัว...',
  'กำลังอ่านพลังธาตุของคุณ...',
  'กำลังอ่านเสาชะตาทั้งสี่...',
  'ดวงชะตากำลังปรากฏ...',
  'กำลังเรียบเรียงคำแนะนำ...',
];

const DAILY_MESSAGES = [
  'กำลังเปิดดวงวันนี้ของคุณ...',
  'ดาวกำลังเรียงตัว...',
  'กำลังเรียบเรียงคำแนะนำ...',
  'กำลังอ่านพลังธาตุของคุณ...',
];

const MESSAGE_INTERVAL_MS = 4_000; // Rotate every 4 seconds

export function LoadingSkeleton({ loadingState, isLoading }: LoadingSkeletonProps) {
  const router = useRouter();
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isReassuring, setIsReassuring] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  // Determine mode: daily (simple) vs chart (store-driven)
  const isDailyMode = isLoading !== undefined;
  const isActive = isDailyMode ? isLoading : loadingState !== 'complete';
  const messages = isDailyMode ? DAILY_MESSAGES : MYSTICAL_MESSAGES;
  const timeoutMs = isDailyMode ? DAILY_TIMEOUT_MS : CHART_TIMEOUT_MS;

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => setIsTimedOut(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [isActive, timeoutMs]);

  // Chart mode only: second-stage reassurance text before the escape hatch.
  useEffect(() => {
    if (isDailyMode || !isActive) return;
    const timer = setTimeout(() => setIsReassuring(true), CHART_REASSURANCE_STAGE_MS);
    return () => clearTimeout(timer);
  }, [isDailyMode, isActive]);

  // Reset timeout when loading finishes
  useEffect(() => {
    if (!isActive) {
      setIsTimedOut(false);
      setIsReassuring(false);
    }
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
        return 'กำลังบันทึกข้อมูลของคุณ...';
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

  // The states that previously rotated MYSTICAL_MESSAGES / DAILY_MESSAGES.
  // Only these hand off to LoadingLine; saving-profile and initializing keep
  // their fixed status text, which reports real progress rather than filling time.
  // 'complete' here means the page is holding the skeleton for the loading
  // floor (useMinLoading) after data already arrived; keep the copy rotating
  // so the floor has something to show.
  const isRotating = isGenerating || loadingState === 'complete';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
      {/* Spacing rhythm (DESIGN.md scale): the mascot and its status message
          are one unit at 24px, and the ancillary hint/escape-hatch sits 48px
          away so it reads as secondary rather than a third equal tier. A
          single space-y-8 gave all three the same weight. */}
      <div className="max-w-md w-full mx-auto flex flex-col items-center text-center gap-6">
        {/* The generated clay sequence is decorative; the live message below
            carries the loading status for assistive technology. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <MainLoader decorative />
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
          ) : isRotating ? (
            // The rotating branch hands off to the shared line pool. The
            // scripted states below it keep their fixed status text.
            <LoadingLine
              surface={isDailyMode ? 'today' : 'fortune'}
              fallback={getLoadingMessage()}
            />
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

        {/* Progress hint for longer waits. Chart mode escalates from a 3s
            "this may take a moment" note to a 30s reassurance that the
            request is still healthy, ahead of the 150s escape hatch. */}
        {isGenerating && !isTimedOut && (
          <motion.p
            key={isDailyMode || !isReassuring ? 'hint' : 'reassurance'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isDailyMode || !isReassuring ? 3 : 0 }}
            className="mt-6 text-inkMuted/60 text-xs md:text-sm"
          >
            {isDailyMode
              ? 'อาจใช้เวลาสักครู่ในการวิเคราะห์ดวงชะตา'
              : isReassuring
                ? 'ยังเรียบเรียงคำทำนายอยู่ รอที่หน้านี้ได้เลย'
                : 'คำทำนายอาจใช้เวลาสักครู่ รอที่หน้านี้ได้เลย'}
          </motion.p>
        )}

        {/* Escape hatch after timeout */}
        {isTimedOut && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
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
