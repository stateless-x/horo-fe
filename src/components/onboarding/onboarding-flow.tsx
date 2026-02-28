'use client';

import { useOnboardingStore } from '@/stores/onboarding';
import { StepWelcome } from './step-welcome';
import { StepName } from './step-name';
import { StepBirthDate } from './step-birth-date';
import { StepGender } from './step-gender';
import { StepBirthTime } from './step-birth-time';
import { StepTeaser } from './step-teaser';
import { StepAuth } from './step-auth';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Main onboarding flow component
 * Orchestrates all 8 steps with animations
 */
export function OnboardingFlow() {
  const { currentStep } = useOnboardingStore();
  const router = useRouter();

  // Handle navigation after onboarding completes
  useEffect(() => {
    if (currentStep === 'dashboard') {
      // Note: Users who authenticate are redirected to /dashboard/fortune via OAuth callback
      // This path is for guest users who skip authentication
      router.push('/dashboard');
    }
  }, [currentStep, router]);

  return (
    <div className="relative min-h-screen bg-voidBlack">
      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && <StepWelcome key="welcome" />}
        {currentStep === 'name' && <StepName key="name" />}
        {currentStep === 'birthDate' && <StepBirthDate key="birthDate" />}
        {currentStep === 'gender' && <StepGender key="gender" />}
        {currentStep === 'birthTime' && <StepBirthTime key="birthTime" />}
        {currentStep === 'teaser' && <StepTeaser key="teaser" />}
        {currentStep === 'auth' && <StepAuth key="auth" />}
      </AnimatePresence>

      {/* Enhanced Progress indicator */}
      {currentStep !== 'welcome' && currentStep !== 'dashboard' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-charcoal/80 backdrop-blur-md rounded-full px-6 py-3 border border-darkPurple/50">
            <div className="flex items-center gap-3">
              {['name', 'birthDate', 'gender', 'birthTime', 'teaser', 'auth'].map((step, index) => {
                const stepOrder = ['name', 'birthDate', 'gender', 'birthTime', 'teaser', 'auth'];
                const currentIndex = stepOrder.indexOf(currentStep);
                const isActive = step === currentStep;
                const isCompleted = index < currentIndex;

                return (
                  <div key={step} className="relative">
                    <motion.div
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-royalPurple ring-4 ring-royalPurple/30'
                          : isCompleted
                          ? 'bg-amethyst'
                          : 'bg-darkPurple/50'
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
                        className="absolute inset-0 bg-royalPurple rounded-full blur-sm"
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
