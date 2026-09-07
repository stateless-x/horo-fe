'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/lib-packages/ui';
import { Button } from '@/lib-packages/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { StepHeading } from './step-heading';

/**
 * Step 2: Name Input
 *
 * "ให้เราเรียกคุณว่าอะไรดี" (Tell me thy name)
 * - Single centered input, auto-focus; the heading is the field's label
 * - Dark field with purple glow on focus
 */
export function StepName() {
  const { profile, updateProfile, nextStep, prevStep } = useOnboardingStore();
  const [name, setName] = useState(profile.name || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateProfile({ name: name.trim() });
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
      <div className="w-full max-w-md space-y-8">
        <StepHeading
          id="step-name-heading"
          title="ให้เราเรียกคุณว่าอะไรดี"
          description="ชื่อเล่นก็ได้ เราจะใช้ชื่อนี้ในคำทำนาย"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น ปลา หรือมิ้นท์"
            aria-labelledby="step-name-heading"
            autoComplete="given-name"
            enterKeyHint="next"
            className="text-center text-lg h-14"
            maxLength={50}
            required
          />

          <div className="flex gap-3">
            <Button type="button" variant="soft" size="lg" onClick={prevStep} className="shrink-0 px-5">
              ย้อนกลับ
            </Button>
            <Button type="submit" size="lg" className="flex-1" disabled={!name.trim()}>
              ถัดไป
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
