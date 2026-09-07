'use client';

import { motion } from 'framer-motion';
import { Button } from '@/lib-packages/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { useRouter } from 'next/navigation';
import { StepHeading } from './step-heading';

/**
 * Step: Returning User Check
 *
 * Asks if user has been here before:
 * - "ยังไม่เคย" -> Continue to name step (primary: most arrivals are new)
 * - "เคยมาแล้ว" -> Go to login
 */
export function StepReturning() {
  const { nextStep } = useOnboardingStore();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-ground"
    >
      <div className="w-full max-w-xs space-y-10">
        <StepHeading title="เคยเปิดดวงกับเราแล้วไหม" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col gap-3"
        >
          <Button size="lg" className="w-full" onClick={nextStep}>
            ครั้งแรก ลองดูดวงเลย
          </Button>
          <Button variant="soft" size="lg" className="w-full" onClick={() => router.push('/login')}>
            เคยมาแล้ว เข้าสู่ระบบ
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
