import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { MainLoader } from '@/components/ui/main-loader';
import { LoadingLine } from '@/components/ui/loading-line';

const PARTICLES = [
  [8, 16, 0.2, 0], [18, 72, 0.35, 0.3], [29, 32, 0.25, 0.9], [39, 84, 0.4, 1.3],
  [52, 13, 0.25, 0.5], [63, 63, 0.3, 1.7], [75, 28, 0.4, 0.7], [87, 78, 0.2, 1.1],
  [94, 43, 0.35, 1.9], [11, 48, 0.3, 0.6], [25, 8, 0.2, 1.5], [46, 55, 0.4, 0.2],
] as const;

interface CompatibilityLoadingProps {
  /** When the request was sent (Date.now()); the status line counts from it. */
  startedAt: number;
  /**
   * From the history response: true when the check writes the teaser alone
   * (locked mode), false for the full report, undefined while history loads.
   */
  lockEnabled?: boolean;
}

/**
 * What the wait is for, by what the POST will write. `slowAfterS`: past it the
 * wait is longer than usual and the screen says so. Unknown (history not
 * loaded yet) promises no content and no time.
 */
const WAIT_COPY = {
  full: {
    line: 'กำลังเขียนฉบับเต็มของคู่นี้',
    what: 'คะแนน ฉายาคู่ และปฏิทิน 3 เดือนคำนวณจากดวง แล้วเนื้อหาทั้ง 4 ส่วนกำลังเขียนให้คู่นี้โดยเฉพาะ',
    usual: 'ปกติใช้เวลาราว 20–30 วินาที',
    slowAfterS: 45,
  },
  teaser: {
    line: 'กำลังอ่านดวงคู่',
    what: 'คะแนนและฉายาคู่คำนวณจากดวง ส่วนคำทำนายสั้น ๆ กำลังเขียนให้คู่นี้โดยเฉพาะ',
    usual: 'ปกติใช้เวลาราว 10 วินาที',
    slowAfterS: 25,
  },
  unknown: { line: 'กำลังอ่านดวงคู่', what: null, usual: null, slowAfterS: 45 },
} as const;

/**
 * The wait for a new ดวงคู่ reading: about 7 s for the locked teaser, 20 to
 * 30 s for the full report. Everything here is honest: the request is already
 * sent, the status says what is being written and how long it usually takes,
 * and says so again when it runs long. The rotating line pool (with its
 * sponsored card) keeps the screen moving.
 */
export function CompatibilityLoading({ startedAt, lockEnabled }: CompatibilityLoadingProps) {
  const copy = WAIT_COPY[lockEnabled === undefined ? 'unknown' : lockEnabled ? 'teaser' : 'full'];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    // The calculate button sits below the fold, especially on phones.
    // Run after the loading view mounts so the new layout determines scroll.
    window.scrollTo({ top: 0, behavior: 'instant' });
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {PARTICLES.map(([left, top, opacity, delay], i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent/20 rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
            }}
            animate={{
              opacity: [opacity, 0.8, opacity],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3.5 + (i % 3) * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center flex flex-col gap-6 max-w-md relative z-10"
      >
        {/* Decorative: the sr-only h2 below is the announced heading, and the
            step text carries live progress. */}
        <MainLoader decorative />

        <div className="space-y-3">
          {/* The visible "กำลังคำนวณ..." heading is gone — the rotating step
              text below already says what's happening, so it only repeated
              itself. The h2 stays as an sr-only landmark: the mount effect
              focuses it, and screen readers still get a heading for the
              screen. */}
          <h2 ref={headingRef} tabIndex={-1} className="sr-only">
            กำลังคำนวณดวงคู่
          </h2>

          <div className="min-h-[28px]">
            <LoadingLine surface="compatibility" fallback={copy.line} />
          </div>

          <div className="mx-auto max-w-sm space-y-1 pt-2 font-thai text-sm leading-relaxed text-inkMuted">
            {copy.what && <p>{copy.what}</p>}
            <p aria-live="polite">
              {elapsed < copy.slowAfterS ? copy.usual : 'ใช้เวลานานกว่าปกติ ยังเขียนอยู่ ไม่ต้องกดซ้ำนะ'}
            </p>
            <p className="font-mono text-xs tabular-nums" aria-hidden="true">
              {elapsed} วินาที
            </p>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-accent/60 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
