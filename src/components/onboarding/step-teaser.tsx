'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Briefcase, Wallet, Activity, Lock, Sparkles } from 'lucide-react';
import { Button, OracleText } from '@/lib-packages/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { api } from '@/lib/api';
import { ClayOracleLoader } from '@/components/ui/clay-oracle-loader';

const LOCKED_CATEGORIES = [
  { icon: Heart, label: 'ความรัก' },
  { icon: Briefcase, label: 'การงาน' },
  { icon: Wallet, label: 'การเงิน' },
  { icon: Activity, label: 'สุขภาพ' },
];

/**
 * Step 6: Teaser Result
 *
 * IMMEDIATE wow moment:
 * - Personalized LLM reading with personality reveal + fortune hints + cliffhanger
 * - Locked fortune category previews to create FOMO
 * - Strong CTA to drive signup
 * - THIS MUST HAPPEN BEFORE AUTH!
 */
export function StepTeaser() {
  const { profile, setTeaserResult, nextStep, prevStep, setStep } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [result, setResult] = useState<{
    elementType: string;
    personality: string;
    todaySnippet: string;
    luckyColor?: string;
    luckyNumber?: number;
  } | null>(null);

  const generateTeaser = async () => {
    const MAX_RETRIES = 2;

    setIsLoading(true);
    setHasFailed(false);
    setIsRateLimited(false);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const data = await api.post<{
          elementType: string;
          personality: string;
          todaySnippet: string;
          luckyColor?: string;
          luckyNumber?: number;
        }>('/api/fortune/teaser', profile);

        setResult(data);
        setTeaserResult(data);
        setIsLoading(false);
        return; // Success
      } catch (error: any) {
        console.error(`Teaser attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, error);

        // Rate limit — don't retry, show rate limit screen immediately
        if (error?.status === 429) {
          setIsRateLimited(true);
          setResult(null);
          setIsLoading(false);
          return;
        }

        // Other 4xx client errors (e.g. 422 validation) are not transient — retrying can't
        // succeed, so fail immediately instead of burning retries. 408 is a timeout, not a
        // client error, so it still falls through to the retry/backoff below.
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 408) {
          setHasFailed(true);
          setResult(null);
          setIsLoading(false);
          return;
        }

        // Last attempt — show error screen
        if (attempt === MAX_RETRIES) {
          setHasFailed(true);
          setResult(null);
          setIsLoading(false);
          return;
        }

        // Wait before retrying (2s, 4s)
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      }
    }
  };

  const hasStartedRef = useRef(false);

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

    generateTeaser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="text-center space-y-4">
          <div className="relative flex min-h-56 items-center justify-center sm:min-h-64">
            <div className="absolute inset-1/4 rounded-full bg-accentBright/15 blur-3xl" aria-hidden="true" />
            <ClayOracleLoader />
          </div>
          <p className="text-inkMuted font-oracle text-lg">
            กำลังมองดูดวงชะตาของเจ้า...
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
            เจ้ากลับมาบ่อยนะ
          </h2>
          <p className="text-inkMuted font-oracle text-lg leading-relaxed">
            ข้าเห็นว่าเจ้าสนใจดวงชะตามาก ลองกลับมาใหม่พรุ่งนี้สิ
            แล้วข้าจะเปิดเผยดวงของเจ้าให้
          </p>
          <Button variant="outline" size="lg" onClick={prevStep}>
            ย้อนกลับ
          </Button>
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
            ดวงชะตายังไม่พร้อมเปิดเผย
          </h2>
          <p className="text-inkMuted font-oracle text-lg leading-relaxed">
            ข้าไม่สามารถอ่านดวงของเจ้าได้ในตอนนี้ ลองอีกครั้งสิ
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="lg" onClick={prevStep}>
              ย้อนกลับ
            </Button>
            <Button size="lg" onClick={generateTeaser}>
              ลองอีกครั้ง
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-lg space-y-6">
        {/* Main Reading Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-surface border border-surface2 rounded-lg p-6 space-y-5"
        >
          {/* Element + Lucky Info Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-inkMuted mb-1">องค์ประกอบหลัก</p>
              <p className="text-2xl font-heading text-accentBright capitalize">
                {result?.elementType}
              </p>
            </div>
            {(result?.luckyColor || result?.luckyNumber) && (
              <div className="flex gap-4">
                {result?.luckyColor && (
                  <div className="text-right">
                    <p className="text-xs text-inkMuted mb-0.5">สีมงคล</p>
                    <p className="text-sm text-ink">
                      {result.luckyColor}
                    </p>
                  </div>
                )}
                {result?.luckyNumber && (
                  <div className="text-right">
                    <p className="text-xs text-inkMuted mb-0.5">เลขมงคล</p>
                    <p className="text-sm text-ink">
                      {result.luckyNumber}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <hr className="border-surface2" />

          {/* Oracle Reading */}
          <OracleText
            text={result?.todaySnippet || ''}
            className="text-base leading-relaxed"
          />
        </motion.div>

        {/* Locked Fortune Previews */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <p className="text-sm text-inkMuted text-center">
            ดวงชะตาของเจ้ายังมีอีกมาก
          </p>

          <div className="grid grid-cols-2 gap-2">
            {LOCKED_CATEGORIES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-accent/10 bg-surface/50 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-accent/40" />
                  <span className="text-sm text-inkMuted">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-inkMuted/50">?/5</span>
                  <Lock className="w-3 h-3 text-inkMuted/30" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center space-y-0.5">
            <p className="text-xs text-inkMuted/60">
              + ทำนายรายปี รายวัน
            </p>
            <p className="text-xs text-inkMuted/60">
              + ดูดวงคู่ความเข้ากัน
            </p>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={prevStep}>
              ย้อนกลับ
            </Button>
            <Button onClick={nextStep} size="lg" className="flex-1">
              เปิดดวงทั้งหมดของเจ้า
            </Button>
          </div>
          <p className="text-xs text-inkMuted/50 text-center">
            ดูดวงชะตาครบ 6 ด้าน + ทำนายรายวัน
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
