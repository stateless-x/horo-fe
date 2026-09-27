'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/lib-packages/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { api, type ApiError } from '@/lib/api';
import { MainLoader } from '@/components/ui/main-loader';
import { completedTeaser, type TeaserResult } from '@/lib/teaser-result';
import { ELEMENT_NAMES_THAI, isClayElement, TeaserResultCard } from '@/components/onboarding/teaser-result-card';
import { setContinueFocus } from '@/lib/teaser-continuity';
import { trackOnboardingStep } from '@/lib/onboarding-funnel';
import { ShareSheet } from '@/components/share/share-sheet';

/**
 * Step 6: Teaser Result
 *
 * IMMEDIATE wow moment, built around three systems agreeing on one trait:
 * - threeWay headline + trait chips (thai / bazi / mbti)
 * - today's reading for the visitor's focus area
 * - all four daily scores, focus area highlighted
 * - dual CTA (full reading vs. compatibility) + share before signup
 * - THIS MUST HAPPEN BEFORE AUTH!
 */
export function StepTeaser() {
  const { profile, teaserResult, setTeaserResult, setPostAuthDestination, nextStep, prevStep, setStep } =
    useOnboardingStore();
  const storedResult = completedTeaser(teaserResult);
  const [isLoading, setIsLoading] = useState(storedResult === null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [result, setResult] = useState<TeaserResult | null>(storedResult);
  const [showShareSheet, setShowShareSheet] = useState(false);

  const generateTeaser = async () => {
    const MAX_RETRIES = 2;

    setIsLoading(true);
    setHasFailed(false);
    setIsRateLimited(false);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const data = await api.post<unknown>('/api/fortune/teaser', profile, { timeout: 60_000 });
        const parsed = completedTeaser(data);

        // A response that isn't a complete v2 shape (e.g. an old backend
        // deploy still on contentVersion 1) is not renderable by this UI —
        // treat it as a failure rather than crash on a missing field.
        if (!parsed) {
          setHasFailed(true);
          setResult(null);
          setIsLoading(false);
          trackOnboardingStep('teaser_failed');
          return;
        }

        setResult(parsed);
        setTeaserResult(parsed);
        setIsLoading(false);
        setContinueFocus(parsed.focusArea);
        trackOnboardingStep('teaser_shown');
        return; // Success
      } catch (raw) {
        // Narrowed here because a catch binding may only be typed `any` or
        // `unknown`; the handler below reads status/body/code off it.
        const error = raw as ApiError;
        console.error(`Teaser attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, error);

        // Rate limit — don't retry, show rate limit screen immediately
        if (error?.status === 429) {
          setIsRateLimited(true);
          setResult(null);
          setIsLoading(false);
          trackOnboardingStep('teaser_rate_limited');
          return;
        }

        // Other 4xx client errors (e.g. 422 validation) are not transient — retrying can't
        // succeed, so fail immediately instead of burning retries. 408 is a timeout, not a
        // client error, so it still falls through to the retry/backoff below.
        const status = error.status ?? 0;
        if (status >= 400 && status < 500 && status !== 408) {
          setHasFailed(true);
          setResult(null);
          setIsLoading(false);
          trackOnboardingStep('teaser_failed');
          return;
        }

        // Last attempt — show error screen
        if (attempt === MAX_RETRIES) {
          setHasFailed(true);
          setResult(null);
          setIsLoading(false);
          trackOnboardingStep('teaser_failed');
          return;
        }

        // Wait before retrying (2s, 4s)
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      }
    }
  };

  const hasStartedRef = useRef(false);

  useEffect(() => {
    // A hard refresh rehydrates a completed teaser straight into state (see
    // useState(storedResult) above), skipping generateTeaser's own
    // trackOnboardingStep('teaser_shown') call — so this covers that path.
    if (storedResult) trackOnboardingStep('teaser_shown');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Run once per mount — re-renders (e.g. from profile identity changes) must not refire the LLM call
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Guard against submitting an incomplete profile (would 422 and can never succeed via retry).
    // Send the user back to the earliest missing required step instead of calling the API.
    if (!profile.name) {
      setStep('name');
      return;
    }
    if (!profile.birthDate) {
      setStep('birthDate');
      return;
    }
    if (!profile.gender) {
      setStep('gender');
      return;
    }

    // A hard refresh rehydrates the completed teaser from localStorage. Keep
    // showing it instead of spending another LLM request for identical input.
    if (storedResult) return;

    generateTeaser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrimaryCta = () => {
    setPostAuthDestination(null);
    trackOnboardingStep('cta_full');
    nextStep();
  };

  const handleCompatCta = () => {
    setPostAuthDestination('/dashboard/compatibility');
    trackOnboardingStep('cta_compat');
    nextStep();
  };

  const handleShareOpen = () => {
    trackOnboardingStep('share_opened');
    setShowShareSheet(true);
  };

  const handleRateLimitSignup = () => {
    setPostAuthDestination(null);
    trackOnboardingStep('cta_full');
    nextStep();
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="text-center flex flex-col gap-6">
          <MainLoader label="กำลังเปิดดวงให้คุณ" />
          <p className="text-inkMuted font-oracle text-lg">
            กำลังเปิดดวงให้คุณ...
          </p>
        </div>
      </motion.div>
    );
  }

  // Rate limited state
  if (isRateLimited) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="w-full max-w-lg space-y-6 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-accentBright" />
          <h2 className="text-2xl font-heading text-ink">
            วันนี้เปิดดวงฟรีครบแล้ว
          </h2>
          <p className="text-inkMuted font-oracle text-lg leading-relaxed">
            เครือข่ายนี้ใช้สิทธิ์ดูดวงเบื้องต้นวันนี้ครบแล้ว
            สมัครสมาชิกเพื่อเปิดดวงเต็มได้ทันที ไม่ต้องรอพรุ่งนี้
          </p>
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={handleRateLimitSignup}>
              สมัครแล้วเปิดดวงเต็มได้เลย
            </Button>
            <Button variant="ghost" size="sm" onClick={prevStep}>
              กลับ
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // LLM generation failed
  if (hasFailed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="w-full max-w-lg space-y-6 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-inkMuted" />
          <h2 className="text-2xl font-heading text-ink">
            เปิดดวงไม่สำเร็จ
          </h2>
          <p className="text-inkMuted font-oracle text-lg leading-relaxed">
            ตอนนี้โหลดคำทำนายไม่ได้ ลองอีกครั้งได้เลย
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="lg" onClick={prevStep}>
              กลับ
            </Button>
            <Button size="lg" onClick={generateTeaser}>
              ลองอีกครั้ง
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // threeWay already names the element/MBTI combination on its own — the
  // platform-specific ธาตุ/hashtag suffix comes from generateShareText, so
  // this stays the one phrase rather than restating the same facts twice.
  const shareText = result?.threeWay || '';
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/?utm_source=share_onboarding` : '';

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-start justify-center px-4 pt-6 pb-40 sm:items-center sm:px-6 sm:pb-36"
      >
        <TeaserResultCard
          result={result}
          onBack={prevStep}
          onShare={handleShareOpen}
          onPrimaryCta={handlePrimaryCta}
          onCompatCta={handleCompatCta}
        />

        <ShareSheet
          isOpen={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          surface="onboarding"
          shareData={{
            url: shareUrl,
            userName: profile.name || 'คุณ',
            element: isClayElement(result?.elementType)
              ? ELEMENT_NAMES_THAI[result.elementType].replace('ธาตุ', '')
              : result?.elementType,
            luckyColor: result?.luckyColor,
            luckyNumber: result?.luckyNumber,
          }}
          phrases={shareText ? [shareText] : undefined}
        />
      </motion.div>
    </MotionConfig>
  );
}
