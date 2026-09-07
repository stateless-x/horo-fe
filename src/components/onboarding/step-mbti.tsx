"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, ExternalLink } from "lucide-react";
import { Button, Card } from "@/lib-packages/ui";
import { useOnboardingStore } from "@/stores/onboarding";
import { MBTI_GROUPS } from "@/lib-packages/shared";
import { MBTI_HINT_ONBOARDING } from "@/lib/mbti-copy";
import { StepHeading } from "./step-heading";

/**
 * Step 5.5: MBTI Type (Optional)
 *
 * "เจ้ารู้จัก MBTI ของตัวเองไหม"
 * - 4 groups x 4 types grid of tappable cards (2 columns on phones)
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
      // Taller than a phone viewport: clear the fixed audio toggle above and
      // the progress pill below instead of letting them cover the grid.
      className="min-h-screen flex items-center justify-center px-6 pt-20 pb-28"
    >
      <div className="w-full max-w-lg space-y-5">
        <StepHeading
          title="เจ้ารู้จัก MBTI ของตัวเองไหม"
          description={MBTI_HINT_ONBOARDING}
        />

        {/* Skip and the test link share one row so the grid starts sooner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-x-1"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="min-h-11 gap-1.5 text-inkMuted hover:text-accentBright"
          >
            <HelpCircle className="size-4" aria-hidden="true" />
            ข้ามขั้นตอนนี้
          </Button>
          <a
            href="https://www.16personalities.com/th"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm text-accentBright transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
          >
            ทำแบบทดสอบ
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </motion.div>

        {/* MBTI Groups Grid */}
        <div className="space-y-4">
          {MBTI_GROUPS.map((group, groupIndex) => (
            <motion.div
              key={group.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + groupIndex * 0.05 }}
              role="group"
              aria-label={group.nameTh}
            >
              {/* Group header */}
              <p className="text-xs text-inkMuted mb-2 pl-1">
                {group.nameTh}{" "}
                <span className="text-inkMuted/50">({group.nameEn})</span>
              </p>

              {/* 4 types per group; two per row on phones so the Thai name stays legible */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {group.types.map((type) => (
                  <motion.button
                    key={type.code}
                    type="button"
                    aria-pressed={selectedType === type.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type.code)}
                    className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
                  >
                    <Card
                      className={`p-2.5 min-h-14 flex flex-col items-center justify-center gap-0.5 transition-all ${
                        selectedType === type.code
                          ? "border-accent bg-accent/10 shadow-lg shadow-accent/30 dark:shadow-accent/40"
                          : "border-accent/20 hover:border-accent/50 hover:shadow-md hover:shadow-accent/15 dark:hover:shadow-accent/20"
                      }`}
                    >
                      <p className="text-sm font-english font-bold text-ink">
                        {type.code}
                      </p>
                      <p className="text-xs text-inkMuted leading-tight">
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
          <Button type="button" variant="soft" size="lg" onClick={prevStep} className="shrink-0 px-5">
            ย้อนกลับ
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            size="lg"
            className="flex-1"
            disabled={!selectedType}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
