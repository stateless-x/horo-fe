"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, HelpCircle } from "lucide-react";
import { Button, Card } from "@/lib-packages/ui";
import { useOnboardingStore } from "@/stores/onboarding";
import { THAI_TIME_PERIODS } from "@/lib-packages/shared";

/**
 * Step 5: Birth Time
 *
 * "ถ้าอยากรู้โชคชะตาที่แม่นขึ้นกว่าเดิม จงบอกช่วงเวลาที่เจ้าเกิดมาซะ"
 * - Period selector with Thai time names
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
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl text-center text-ghostWhite font-heading leading-relaxed"
          >
            ถ้าอยากรู้โชคชะตาที่แม่นขึ้นกว่าเดิม
            <br />
            จงบอกช่วงเวลาที่เจ้าเกิดมาซะ
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-ashGray text-sm md:text-base"
          >
            <Clock className="inline-block w-4 h-4 mr-1" />
            เวลาเกิดช่วยให้การดูดวงแม่นยำยิ่งขึ้น
          </motion.p>
        </div>

        <div className="space-y-6">
          {/* Time Period Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {THAI_TIME_PERIODS.map((period, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(index)}
              >
                <Card
                  className={`p-4 h-24 flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedPeriod === index
                      ? "border-royalPurple bg-royalPurple/5 shadow-[0_0_20px_rgba(107,33,168,0.5)]"
                      : "hover:border-amethyst hover:bg-amethyst/5"
                  }`}
                >
                  <p className="text-lg font-heading text-ghostWhite">
                    {period.name}
                  </p>
                  <p className="text-xs text-ashGray">{period.label}</p>
                </Card>
              </motion.button>
            ))}
          </div>

          {/* Unknown Option - More Prominent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 border-darkPurple bg-deepNight/50">
              <button
                onClick={handleUnknown}
                className="w-full flex items-center justify-center gap-3 py-2 text-ashGray hover:text-ghostWhite transition-colors group"
              >
                <HelpCircle className="w-5 h-5 group-hover:text-amethyst transition-colors" />
                <div className="text-left">
                  <p className="text-base font-heading text-ghostWhite">
                    ไม่แน่ใจ หรือ ไม่ทราบเวลาเกิด
                  </p>
                  <p className="text-xs text-ashGray">
                    เจ้าจะได้รับการทำนายจากโหราศาสตร์ไทยเท่านั้น
                  </p>
                </div>
              </button>
            </Card>
          </motion.div>

          {/* Submit Button */}
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
      </div>
    </motion.div>
  );
}
