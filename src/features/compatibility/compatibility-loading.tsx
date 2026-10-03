import { useEffect, useState } from 'react';
import { GenerationLoadingState } from '@/components/ui/generation-loading-state';

interface CompatibilityLoadingProps {
  /** When the request was sent (Date.now()). */
  startedAt: number;
  /** True when the request creates a teaser rather than the full report. */
  lockEnabled?: boolean;
}

const WAIT_COPY = {
  full: { line: 'กำลังเขียนฉบับเต็มของคู่นี้', usual: 'ปกติใช้เวลาราว 20–30 วินาที', slowAfterS: 45 },
  teaser: { line: 'กำลังอ่านดวงคู่', usual: 'ปกติใช้เวลาราว 10 วินาที', slowAfterS: 25 },
  unknown: { line: 'กำลังอ่านดวงคู่', usual: null, slowAfterS: 45 },
} as const;

/** The shared long-wait composition for a compatibility reading. */
export function CompatibilityLoading({ startedAt, lockEnabled }: CompatibilityLoadingProps) {
  const copy = WAIT_COPY[lockEnabled === undefined ? 'unknown' : lockEnabled ? 'teaser' : 'full'];
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const remainingMs = Math.max(0, copy.slowAfterS * 1_000 - (Date.now() - startedAt));
    const timer = setTimeout(() => setIsSlow(true), remainingMs);
    return () => clearTimeout(timer);
  }, [copy.slowAfterS, startedAt]);

  useEffect(() => {
    setIsSlow(false);
  }, [startedAt]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <GenerationLoadingState
      className="min-h-[calc(100vh-3.5rem)]"
      label={copy.line}
      detail={isSlow ? 'ใช้เวลานานกว่าปกติ ยังเขียนอยู่ ไม่ต้องกดซ้ำนะ' : copy.usual ?? undefined}
    />
  );
}
