'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { Sparkles, Share2, Lock } from 'lucide-react';
import { Button, OracleText } from '@/lib-packages/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { api, type ApiError } from '@/lib/api';
import { MainLoader } from '@/components/ui/main-loader';
import { ElementClayImage, type ClayElement } from '@/components/ui/element-clay-image';
import { CategoryClayImage } from '@/components/ui/category-clay-image';
import { FORTUNE_CATEGORY_CONFIG, DAILY_CATEGORY_KEYS, type FortuneCategoryKey } from '@/lib/fortune-category-config';
import { completedTeaser, type TeaserResult, type TeaserScores, type TeaserTraitChip } from '@/lib/teaser-result';
import { setContinueFocus } from '@/lib/teaser-continuity';
import { trackOnboardingStep } from '@/lib/onboarding-funnel';
import { ShareSheet } from '@/components/share/share-sheet';

const ELEMENT_NAMES_THAI: Record<ClayElement, string> = {
  wood: 'ธาตุไม้',
  fire: 'ธาตุไฟ',
  earth: 'ธาตุดิน',
  metal: 'ธาตุทอง',
  water: 'ธาตุน้ำ',
};

function isClayElement(value: string | undefined): value is ClayElement {
  return value !== undefined && value in ELEMENT_NAMES_THAI;
}

/** The backend always sets focusArea to one of the four daily categories
 * (see horo-be's DailyCategory / selectFocusArea) — this narrows the wider
 * FortuneCategoryKey type down so `scores[focusArea]` type-checks. */
function isDailyCategory(key: FortuneCategoryKey): key is keyof TeaserScores & FortuneCategoryKey {
  return (DAILY_CATEGORY_KEYS as readonly FortuneCategoryKey[]).includes(key);
}

function clampScore(score: number): number {
  return Math.round(Math.min(Math.max(score, 0), 100));
}

/** Short UI band word for a score, mirroring horo-be's focusBandTh thresholds
 * (≥75 / ≥60 / ≥45 / else) with labels sized for this compact row rather than
 * the backend's longer prose. */
function bandWordTh(score: number): string {
  if (score >= 75) return 'ดีมาก';
  if (score >= 60) return 'ดี';
  if (score >= 45) return 'กลางๆ';
  return 'ต้องใส่ใจ';
}

/** One quiet identity line built from trait chip labels only — never the
 * trait phrases themselves, which stay locked until signup. Omits a part
 * when its chip is missing. */
function identityLineFromChips(elementLabel: string | null, chips: TeaserTraitChip[]): string {
  const parts: string[] = [];
  if (elementLabel) parts.push(elementLabel);
  const thai = chips.find((chip) => chip.system === 'thai');
  if (thai) parts.push(thai.label);
  const mbti = chips.find((chip) => chip.system === 'mbti');
  if (mbti) parts.push(mbti.label);
  return parts.join(' · ');
}

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

  const elementLabel = result && isClayElement(result.elementType) ? ELEMENT_NAMES_THAI[result.elementType] : null;
  const identityLine = result ? identityLineFromChips(elementLabel, result.traitChips) : '';
  const focusConfig = result ? FORTUNE_CATEGORY_CONFIG[result.focusArea] : null;
  const focusScore = result && isDailyCategory(result.focusArea) ? clampScore(result.scores[result.focusArea]) : 0;
  const isFocusLove = result?.focusArea === 'love';
  const lockedCategories = result ? DAILY_CATEGORY_KEYS.filter((key) => key !== result.focusArea) : [];

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-start justify-center px-4 pt-6 pb-40 sm:items-center sm:px-6 sm:pb-36"
      >
        <div className="w-full max-w-md">
          {/* Top bar: back only — the share affordance lives inline on the identity line below,
              out of the way of onboarding-flow's fixed top-right audio toggle */}
          <div className="mb-2 flex items-center">
            <Button variant="ghost" size="sm" onClick={prevStep}>
              กลับ
            </Button>
          </div>

          <div className="flex flex-col items-center gap-5 pt-2 text-center sm:gap-6">
            {/* Hero: the user's element, with a soft glow behind it */}
            {elementLabel && isClayElement(result?.elementType) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="relative flex items-center justify-center"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 m-auto size-28 rounded-full blur-2xl sm:size-32"
                  style={{ backgroundColor: `color-mix(in srgb, var(--el-${result?.elementType}) 35%, transparent)` }}
                />
                <ElementClayImage
                  element={result!.elementType as ClayElement}
                  alt=""
                  sizes="128px"
                  className="size-28 sm:size-32"
                  priority
                />
              </motion.div>
            )}

            {/* Identity line: labels only, never the trait phrases — share sits inline at
                its end so the button never collides with the fixed audio toggle */}
            {identityLine && (
              <div className="flex items-center gap-0.5">
                <p className="text-sm text-inkMuted">{identityLine}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-11 shrink-0 p-0"
                  onClick={handleShareOpen}
                  aria-label="แชร์ตัวตนของฉัน"
                >
                  <Share2 className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            )}

            {/* Headline: the one trait all systems agree on */}
            <h1 className="text-balance font-heading text-2xl font-semibold leading-snug text-ink sm:text-3xl">
              {result?.threeWay}
            </h1>

            {/* Oracle reading */}
            <OracleText
              text={result?.reading || ''}
              speed={Math.max(4, Math.round(1200 / Math.max(1, (result?.reading || '').length)))}
              className="max-w-[34ch] text-[15px] leading-relaxed sm:text-base"
            />

            {/* One focus-area score, plus the rest locked */}
            {result && focusConfig && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full space-y-3"
              >
                <div className="flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3">
                  <CategoryClayImage category={result.focusArea} className="size-10 shrink-0" />
                  <span className="flex-1 text-left text-sm text-ink">{focusConfig.label}วันนี้</span>
                  <span
                    className={`text-sm font-heading tabular-nums ${
                      isFocusLove ? 'text-pink-600 dark:text-pink-400' : 'text-accentBright'
                    }`}
                  >
                    {bandWordTh(focusScore)} {focusScore}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {lockedCategories.map((key) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs text-inkMuted"
                    >
                      <Lock className="size-3" aria-hidden="true" />
                      {FORTUNE_CATEGORY_CONFIG[key].label}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-inkMuted">สมัครเพื่อเปิดดูอีก 3 ด้าน</p>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full space-y-3 pt-1"
            >
              <Button onClick={handlePrimaryCta} size="lg" className="w-full">
                อ่านดวงเต็มของฉัน
              </Button>
              <Button
                variant="ghost"
                onClick={handleCompatCta}
                className="w-full text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
              >
                หรือเช็คดวงกับคนคุย
              </Button>
            </motion.div>
          </div>
        </div>

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
