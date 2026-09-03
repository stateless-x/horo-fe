"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Card, Button } from "@/lib-packages/ui";
import { useOnboardingStore } from "@/stores/onboarding";
import type { Gender } from "@/lib-packages/shared";

/**
 * Step 4: Gender
 *
 * "แล้วเจ้าเป็นผู้ชาย หรือ ผู้หญิงหล่ะ"
 * - Two large tappable cards (male/female)
 * - Cards glow purple on select
 * - Needed for Bazi 大運 calculation
 */
export function StepGender() {
  const { updateProfile, nextStep, prevStep } = useOnboardingStore();

  const handleSelect = (gender: Gender) => {
    updateProfile({ gender });
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md space-y-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl text-center text-ink font-heading"
        >
          แล้วเพศกำเนิดของเจ้าเป็นผู้ชาย หรือ ผู้หญิงล่ะ
        </motion.h1>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect("male")}
            className="group"
          >
            <Card className="p-8 h-48 flex flex-col items-center justify-center gap-4 transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/30 dark:hover:shadow-accent/40">
              <div className="relative">
                <User
                  size={64}
                  className="text-accent stroke-[1.5] transition-colors group-hover:text-accentBright"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-xl font-heading text-ink">ผู้ชาย</p>
            </Card>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect("female")}
            className="group"
          >
            <Card className="p-8 h-48 flex flex-col items-center justify-center gap-4 transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/30 dark:hover:shadow-accent/40">
              <div className="relative">
                <User
                  size={64}
                  className="text-accentBright stroke-[1.5] transition-colors group-hover:text-accent"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-xl font-heading text-ink">ผู้หญิง</p>
            </Card>
          </motion.button>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={prevStep}
          className="w-full mt-6"
        >
          ย้อนกลับ
        </Button>
      </div>
    </motion.div>
  );
}
