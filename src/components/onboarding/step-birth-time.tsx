"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Button, Card } from "@/lib-packages/ui";
import { useOnboardingStore } from "@/stores/onboarding";
import { THAI_TIME_PERIODS } from "@/lib-packages/shared";
import { StepHeading } from "./step-heading";

/**
 * Step 5: Birth Time
 *
 * "พอจำเวลาเกิดได้ไหม"
 * - Period selector with Thai time names + 24h time ranges
 * - Map to Chinese 2-hour periods (時辰): 12 periods
 * - Include "ไม่รู้" (don't know) option → skips the hour pillar, keeps the rest
 */
export function StepBirthTime() {
  const { updateProfile, nextStep, prevStep } = useOnboardingStore();
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelectedPeriod(index);
  };

  const handleUnknown = () => {
    updateProfile({
      birthTime: {
        period: "unknown",
        chineseHour: 0,
        isUnknown: true,
      },
    });
    nextStep();
  };

  const handleSubmit = () => {
    if (selectedPeriod !== null) {
      const period = THAI_TIME_PERIODS[selectedPeriod];
      updateProfile({
        birthTime: {
          period: period.name,
          chineseHour: period.chineseHour,
          isUnknown: false,
        },
      });
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center px-4 pt-20 pb-36 sm:px-6 sm:pb-32"
    >
      <div className="w-full max-w-lg space-y-6">
        <StepHeading
          title="พอจำเวลาเกิดได้ไหม"
          description="ใช้ดูเสาชั่วโมงในปาจื้อ ถ้าไม่รู้ก็ข้ามได้"
        />

        {/* Skip option — above grid so it's immediately visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUnknown}
            className="min-h-11 gap-1.5 text-inkMuted hover:text-accentBright"
          >
            <HelpCircle className="size-4" aria-hidden="true" />
            ไม่รู้เวลาเกิด ข้ามขั้นตอนนี้
          </Button>
        </motion.div>

        {/* Time Period Grid — 3 columns */}
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="ช่วงเวลาเกิด">
          {THAI_TIME_PERIODS.map((period, index) => (
            <motion.button
              key={index}
              type="button"
              aria-pressed={selectedPeriod === index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(index)}
              className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
            >
              <Card
                className={`p-3 flex flex-col items-center justify-center gap-0.5 transition-all ${
                  selectedPeriod === index
                    ? "border-accent bg-accent/10 shadow-lg shadow-accent/30 dark:shadow-accent/40"
                    : "border-accent/20 hover:border-accent/50 hover:shadow-md hover:shadow-accent/15 dark:hover:shadow-accent/20"
                }`}
              >
                <p className="text-base font-heading text-ink">
                  {period.displayName}
                </p>
                <p className="text-xs text-inkMuted tabular-nums">{period.timeRange.replace('-', ' ถึง ')}</p>
              </Card>
            </motion.button>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button type="button" variant="soft" size="lg" onClick={prevStep} className="shrink-0 px-5">
            ย้อนกลับ
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            size="lg"
            className="flex-1"
            disabled={selectedPeriod === null}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
