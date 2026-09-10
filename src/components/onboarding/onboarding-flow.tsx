'use client';

import { useOnboardingStore, type OnboardingStep } from '@/stores/onboarding';
import { StepWelcome } from './step-welcome';
import { StepReturning } from './step-returning';
import { StepName } from './step-name';
import { StepBirthDate } from './step-birth-date';
import { StepGender } from './step-gender';
import { StepBirthTime } from './step-birth-time';
import { StepMbti } from './step-mbti';
import { StepTeaser } from './step-teaser';
import { StepAuth } from './step-auth';
import { AmbientAudioToggle } from './ambient-audio-toggle';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAmbientAudio } from '@/hooks/use-ambient-audio';
import { DEFAULT_AUTHENTICATED_PATH, sanitizeReturnTo } from '@/lib/auth-navigation';

// The steps the visitor sees counted; welcome and the returning check are a
// prologue, so the counter starts at the first question.
const PROGRESS_STEPS: OnboardingStep[] = ['name', 'birthDate', 'gender', 'birthTime', 'mbti', 'teaser', 'auth'];

/**
 * Main onboarding flow component
 * Orchestrates all 8 steps with animations
 */
export function OnboardingFlow({
  returnTo = DEFAULT_AUTHENTICATED_PATH,
}: {
  returnTo?: string;
}) {
  const { currentStep } = useOnboardingStore();
  const router = useRouter();
  const { isMuted, toggleMute } = useAmbientAudio();
  const destination = sanitizeReturnTo(returnTo);

  // Handle navigation after onboarding completes
  useEffect(() => {
    if (currentStep === 'dashboard') {
      router.replace(destination);
    }
  }, [currentStep, destination, router]);

  return (
    <div className="relative min-h-screen bg-ground text-ink">
      {/* Ambient audio mute/unmute toggle */}
      <AmbientAudioToggle isMuted={isMuted} onToggle={toggleMute} />

      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && <StepWelcome key="welcome" />}
        {currentStep === 'returning' && <StepReturning key="returning" returnTo={destination} />}
        {currentStep === 'name' && <StepName key="name" />}
        {currentStep === 'birthDate' && <StepBirthDate key="birthDate" />}
        {currentStep === 'gender' && <StepGender key="gender" />}
        {currentStep === 'birthTime' && <StepBirthTime key="birthTime" />}
        {currentStep === 'mbti' && <StepMbti key="mbti" />}
        {currentStep === 'teaser' && <StepTeaser key="teaser" />}
        {currentStep === 'auth' && <StepAuth key="auth" returnTo={destination} />}
      </AnimatePresence>

      {/* Enhanced Progress indicator */}
      {currentStep !== 'welcome' && currentStep !== 'returning' && currentStep !== 'dashboard' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute inset-x-0 bottom-0 z-50 flex justify-center bg-gradient-to-t from-ground via-ground/90 to-transparent pb-6 pt-8 [@media(min-height:640px)]:fixed"
        >
          <div className="flex items-center gap-4 bg-overlay/80 backdrop-blur-md rounded-full pl-5 pr-6 py-3 border border-surface2/50">
            <p className="text-xs text-inkMuted whitespace-nowrap tabular-nums" aria-live="polite">
              ขั้นที่ {PROGRESS_STEPS.indexOf(currentStep) + 1} จาก {PROGRESS_STEPS.length}
            </p>
            <div className="flex items-center gap-3" aria-hidden="true">
              {PROGRESS_STEPS.map((step, index) => {
                const currentIndex = PROGRESS_STEPS.indexOf(currentStep);
                const isActive = step === currentStep;
                const isCompleted = index < currentIndex;

                return (
                  <div key={step} className="relative">
                    <motion.div
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-accent ring-4 ring-accent/30'
                          : isCompleted
                          ? 'bg-accentBright'
                          : 'bg-surface2/50'
                      }`}
                      animate={isActive ? {
                        scale: [1, 1.3, 1],
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: 2,
                        ease: "easeInOut"
                      }}
                    />
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-accent rounded-full blur-sm"
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.5, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: 2,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
