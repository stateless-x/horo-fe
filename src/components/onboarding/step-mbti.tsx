"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, ExternalLink } from "lucide-react";
import { Button, Card } from "@/lib-packages/ui";
import { useOnboardingStore } from "@/stores/onboarding";
import { MBTI_GROUPS } from "@/lib-packages/shared";

/**
 * Step 5.5: MBTI Type (Optional)
 *
 * "เจ้ารู้จัก MBTI ของตัวเองไหม?"
 * - 4 groups x 4 types grid of tappable cards
 * - "ไม่รู้" option with link to 16personalities.com/th
 * - Skip sets mbtiType to undefined (excluded from LLM prompt)
 */
export function StepMbti() {
  const { profile, updateProfile, nextStep, prevStep } = useOnboardingStore();
  const [selectedType, setSelectedType] = useState<string | null>(
    profile.mbtiType ?? null
  );

  const handleSkip = () => {
    updateProfile({ mbtiType: undefined });
    nextStep();
  };

  const handleSubmit = () => {
    if (selectedType) {
      updateProfile({ mbtiType: selectedType });
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
      <div className="w-full max-w-lg space-y-5">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl text-center text-ink font-heading"
        >
          เจ้ารู้จัก MBTI ของตัวเองไหม?
        </motion.h1>

        {/* Skip option — above grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 text-sm text-inkMuted hover:text-accentBright transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            ไม่รู้ MBTI ของตัวเอง?{" "}
            <span className="underline underline-offset-2">
              ข้ามขั้นตอนนี้
            </span>
          </button>
          <p className="text-xs text-inkMuted/70">
            MBTI คือรูปแบบบุคลิกภาพ 16 แบบที่ช่วยให้เข้าใจตัวเองมากขึ้น{" "}
            <a
              href="https://www.16personalities.com/th"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accentBright hover:text-accent transition-colors underline underline-offset-2"
            >
              ทำแบบทดสอบที่นี่
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </motion.div>

        {/* MBTI Groups Grid */}
        <div className="space-y-4">
          {MBTI_GROUPS.map((group, groupIndex) => (
            <motion.div
              key={group.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + groupIndex * 0.05 }}
            >
              {/* Group header */}
              <p className="text-xs text-inkMuted mb-2 pl-1">
                {group.nameTh}{" "}
                <span className="text-inkMuted/50">({group.nameEn})</span>
              </p>

              {/* 4 types in a row */}
              <div className="grid grid-cols-4 gap-2">
                {group.types.map((type) => (
                  <motion.button
                    key={type.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type.code)}
                  >
                    <Card
                      className={`p-2.5 flex flex-col items-center justify-center gap-0.5 transition-all ${
                        selectedType === type.code
                          ? "border-accent bg-accent/10 shadow-lg shadow-accent/30 dark:shadow-accent/40"
                          : "border-accent/20 hover:border-accent/50 hover:shadow-md hover:shadow-accent/15 dark:hover:shadow-accent/20"
                      }`}
                    >
                      <p className="text-sm font-heading font-bold text-ink">
                        {type.code}
                      </p>
                      <p className="text-[10px] text-inkMuted leading-tight">
                        {type.nameTh}
                      </p>
                    </Card>
                  </motion.button>
                ))}
              </div>
            </motion.div>
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
            disabled={!selectedType}
          >
            {selectedType ? "ถัดไป" : "กรุณาเลือก MBTI"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
