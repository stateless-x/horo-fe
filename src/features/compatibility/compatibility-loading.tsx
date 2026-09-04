import { motion, AnimatePresence } from 'framer-motion';
import { ClayOracleLoader } from '@/components/ui/clay-oracle-loader';

interface CompatibilityLoadingProps {
  calculationStep: string;
}

export function CompatibilityLoading({ calculationStep }: CompatibilityLoadingProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 max-w-md relative z-10"
      >
        <div className="relative flex min-h-56 items-center justify-center sm:min-h-64">
          <div className="absolute inset-1/4 rounded-full bg-accentBright/15 blur-3xl" aria-hidden="true" />
          <ClayOracleLoader />
        </div>

        <div className="space-y-3">
          <motion.h2
            className="text-3xl font-heading text-ink"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            กำลังคำนวณ...
          </motion.h2>

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

          <div className="flex justify-center gap-2 mt-4">
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
