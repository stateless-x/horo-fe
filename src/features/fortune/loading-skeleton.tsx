'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LoadingState } from '@/stores/fortune';
import { GenerationLoadingState } from '@/components/ui/generation-loading-state';
import { CHART_BUDGET, DAILY_BUDGET } from '@/lib-packages/shared';

interface LoadingSkeletonProps {
  /** Loading state from the fortune store (chart flow). */
  loadingState?: LoadingState;
  /** Simple loading flag for the daily reading. */
  isLoading?: boolean;
}

const CHART_TIMEOUT_MS = CHART_BUDGET.escapeHatchMs;
const DAILY_TIMEOUT_MS = DAILY_BUDGET.escapeHatchMs;
const REASSURANCE_STAGE_MS = 30_000;

/**
 * The long-wait state for a fortune. It keeps progress copy stable and only
 * adds recovery after the backend-aligned escape hatch.
 */
export function LoadingSkeleton({ loadingState, isLoading }: LoadingSkeletonProps) {
  const router = useRouter();
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isReassuring, setIsReassuring] = useState(false);
  const isDailyMode = isLoading !== undefined;
  const isActive = isDailyMode ? isLoading : loadingState !== 'complete';
  const timeoutMs = isDailyMode ? DAILY_TIMEOUT_MS : CHART_TIMEOUT_MS;

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => setIsTimedOut(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [isActive, timeoutMs]);

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => setIsReassuring(true), REASSURANCE_STAGE_MS);
    return () => clearTimeout(timer);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      setIsTimedOut(false);
      setIsReassuring(false);
    }
  }, [isActive]);

  const status = (() => {
    if (isDailyMode) return 'กำลังเปิดดวงวันนี้ให้คุณ';
    switch (loadingState) {
      case 'saving-profile':
        return 'กำลังบันทึกข้อมูลของคุณ';
      case 'generating-chart':
      case 'generating-narrative':
        return 'กำลังเรียบเรียงคำทำนายให้คุณ';
      case 'initializing':
      default:
        return 'กำลังเตรียมดวงของคุณ';
    }
  })();

  const isGenerating = isDailyMode || loadingState === 'generating-chart' || loadingState === 'generating-narrative';
  const detail = isTimedOut
    ? 'ใช้เวลานานกว่าปกติ ลองใหม่ได้เลย'
    : isReassuring
      ? 'ยังเรียบเรียงคำทำนายอยู่ รอที่หน้านี้ได้เลย'
      : isGenerating
        ? 'อาจใช้เวลาสักครู่ในการวิเคราะห์ดวงชะตา'
        : undefined;

  return (
    <GenerationLoadingState label={status} detail={detail}>
      {isTimedOut && (
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="min-h-11 rounded-lg bg-accent px-6 py-2 font-heading text-accentInk transition-colors hover:bg-accentBright"
          >
            ลองใหม่
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="min-h-11 rounded-lg border border-accent/50 px-6 py-2 font-heading text-inkMuted transition-colors hover:text-ink"
          >
            กลับหน้าหลัก
          </button>
        </div>
      )}
    </GenerationLoadingState>
  );
}
