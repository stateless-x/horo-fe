"use client";

import { motion } from "framer-motion";
import { Mars, Venus } from "lucide-react";
import { Card, Button } from "@/lib-packages/ui";
import { useOnboardingStore } from "@/stores/onboarding";
import type { Gender } from "@/lib-packages/shared";
import { StepHeading } from "./step-heading";

const OPTIONS: { value: Gender; label: string; Icon: typeof Mars }[] = [
  { value: "male", label: "ผู้ชาย", Icon: Mars },
  { value: "female", label: "ผู้หญิง", Icon: Venus },
];

/**
 * Step 4: Gender
 *
 * "เพศกำเนิดของเจ้า"
 * - Two large tappable cards (male/female); tapping advances immediately
 * - Cards glow purple on hover
 * - Needed for Bazi 大運 calculation, and the why-line says so
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
        <StepHeading
          title="เพศกำเนิดของเจ้า"
          description="ปาจื้อคำนวณจังหวะชีวิตต่างกันตามเพศกำเนิด ข้าใช้เพื่อการคำนวณเท่านั้น"
        />

        <div className="grid grid-cols-2 gap-4" role="group" aria-label="เพศกำเนิด">
          {OPTIONS.map(({ value, label, Icon }) => (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(value)}
              className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
            >
              <Card className="p-6 h-44 flex flex-col items-center justify-center gap-4 border-accent/20 transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/30 dark:hover:shadow-accent/40">
                <Icon
                  size={56}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-accentBright transition-colors group-hover:text-accent"
                />
                <p className="text-xl font-heading text-ink">{label}</p>
              </Card>
            </motion.button>
          ))}
        </div>

        <Button variant="soft" size="lg" onClick={prevStep} className="w-full">
          ย้อนกลับ
        </Button>
      </div>
    </motion.div>
  );
}
