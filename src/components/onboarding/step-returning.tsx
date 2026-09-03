'use client';

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/stores/onboarding';
import { useRouter } from 'next/navigation';

/**
 * Step: Returning User Check
 *
 * Asks if user has been here before:
 * - "เคยแล้ว" -> Go to login
 * - "ข้ายังไม่เคยมา" -> Continue to name step
 */
export function StepReturning() {
  const { nextStep } = useOnboardingStore();
  const router = useRouter();

  const handleReturningUser = () => {
    router.push('/login');
  };

  const handleNewUser = () => {
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-ground"
    >
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="font-heading text-2xl md:text-3xl text-ink mb-2">
          เจ้าเคยมาที่นี่แล้วหรือยังล่ะ?
        </h1>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        {/* Returning user */}
        <button
          onClick={handleReturningUser}
          className="w-full py-4 px-6 rounded-xl font-heading text-lg bg-accent hover:bg-accentBright text-accentInk transition-all duration-200 shadow-lg shadow-accent/20"
        >
          เคยแล้ว
        </button>

        {/* New user */}
        <button
          onClick={handleNewUser}
          className="w-full py-4 px-6 rounded-xl font-heading text-lg bg-overlay hover:bg-surface2/50 text-ink border border-surface2/50 hover:border-accentBright/30 transition-all duration-200"
        >
          ข้ายังไม่เคยมา
        </button>
      </motion.div>
    </motion.div>
  );
}
