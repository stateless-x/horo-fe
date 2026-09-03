"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Button, Card } from "@/lib-packages/ui";
import { useOnboardingStore } from "@/stores/onboarding";
import { THAI_TIME_PERIODS } from "@/lib-packages/shared";

/**
 * Step 5: Birth Time
 *
 * "บอกช่วงเวลาเกิดของเจ้ามาสิ"
 * - Period selector with Thai time names + 24h time ranges
 * - Map to Chinese 2-hour periods (時辰): 12 periods
 * - Include "ไม่ทราบ" (don't know) option → skips Bazi, uses Thai astrology only
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
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-lg space-y-6">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl text-center text-ink font-heading"
        >
          บอกช่วงเวลาเกิดของเจ้ามาสิ
        </motion.h1>

        {/* Skip option — above grid so it's immediately visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={handleUnknown}
            className="inline-flex items-center gap-1.5 text-sm text-inkMuted hover:text-accentBright transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            ไม่ทราบเวลาเกิด?{" "}
            <span className="underline underline-offset-2">
              ข้ามขั้นตอนนี้
            </span>
          </button>
        </motion.div>

        {/* Time Period Grid — 3 columns */}
        <div className="grid grid-cols-3 gap-2">
          {THAI_TIME_PERIODS.map((period, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(index)}
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
                <p className="text-xs text-inkMuted">{period.timeRange}</p>
              </Card>
            </motion.button>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={prevStep}
            className="w-full"
          >
            ย้อนกลับ
          </Button>
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full"
            disabled={selectedPeriod === null}
          >
            {selectedPeriod !== null ? "ถัดไป" : "กรุณาเลือกช่วงเวลา"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
