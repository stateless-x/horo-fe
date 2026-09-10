import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { MainLoader } from '@/components/ui/main-loader';
import { LoadingLine } from '@/components/ui/loading-line';

const PARTICLES = [
  [8, 16, 0.2, 0], [18, 72, 0.35, 0.3], [29, 32, 0.25, 0.9], [39, 84, 0.4, 1.3],
  [52, 13, 0.25, 0.5], [63, 63, 0.3, 1.7], [75, 28, 0.4, 0.7], [87, 78, 0.2, 1.1],
  [94, 43, 0.35, 1.9], [11, 48, 0.3, 0.6], [25, 8, 0.2, 1.5], [46, 55, 0.4, 0.2],
] as const;

interface CompatibilityLoadingProps {
  calculationStep: string;
  /**
   * True once the scripted steps have run out. The last step used to sit
   * frozen on screen for the whole LLM wait, so from here the rotating line
   * pool takes over and the screen keeps moving.
   */
  stepsExhausted?: boolean;
}

export function CompatibilityLoading({ calculationStep, stepsExhausted }: CompatibilityLoadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

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

          {stepsExhausted ? (
            <div className="min-h-[28px]">
              <LoadingLine surface="compatibility" fallback={calculationStep} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.p
                key={calculationStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg md:text-xl text-inkMuted font-oracle min-h-[28px]"
              >
                {calculationStep}
              </motion.p>
            </AnimatePresence>
          )}

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
