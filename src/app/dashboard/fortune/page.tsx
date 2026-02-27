'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/lib-packages/ui';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useOnboardingStore } from '@/stores/onboarding';

/**
 * Fortune Detail Page (Post-Registration)
 *
 * This page shows the FULL fortune reading after user completes auth.
 * It handles:
 * - Streaming/progressive loading of LLM-generated content
 * - Skeleton loading states while generating
 * - Mobile-first responsive design
 * - Saving the birth profile to the backend
 *
 * Flow: User completes auth → lands here → sees their full fortune
 */

interface FortuneReading {
  baziChart: {
    yearPillar: { stem: string; branch: string };
    monthPillar: { stem: string; branch: string };
    dayPillar: { stem: string; branch: string };
    hourPillar?: { stem: string; branch: string };
    dayMaster: string;
    element: string;
  };
  thaiAstrology: {
    day: string;
    color: string;
    planet: string;
    personality: string;
    luckyNumber: number;
    luckyDirection: string;
  };
  narrative: string;
  currentAge: number;
}

type LoadingState = 'initializing' | 'saving-profile' | 'generating-chart' | 'generating-narrative' | 'complete';

export default function FortuneDetailPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const { profile, teaserResult } = useOnboardingStore();

  const [loadingState, setLoadingState] = useState<LoadingState>('initializing');
  const [fortuneReading, setFortuneReading] = useState<FortuneReading | null>(null);
  const [narrativeChunks, setNarrativeChunks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied'>('idle');

  // Handle share functionality
  // Memoized to prevent recreation on every render, which is important because:
  // 1. This function is passed as onClick handler to a button
  // 2. Prevents unnecessary re-renders if the button component is memoized in the future
  // 3. The function only needs to change when fortuneReading changes
  const handleShare = useCallback(async () => {
    if (!fortuneReading) return;

    const shareText = `ดวงชะตาของฉัน: ${fortuneReading.baziChart.element} 🔮

สีมงคล: ${fortuneReading.thaiAstrology.color}
เลขมงคล: ${fortuneReading.thaiAstrology.luckyNumber}
ดาวประจำวัน: ${fortuneReading.thaiAstrology.planet}

มาดูดวงของคุณกันเถอะ!`;

    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/fortune`;

    try {
      // Try Web Share API (mobile)
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Horo - ดวงชะตาของฉัน',
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: Copy to clipboard (desktop)
        const fullText = `${shareText}\n\n${shareUrl}`;
        await navigator.clipboard.writeText(fullText);
        setShareStatus('copied');

        // Reset status after 2 seconds
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Share error:', error);
      // Fallback to clipboard even if share fails
      try {
        const fullText = `${shareText}\n\n${shareUrl}`;
        await navigator.clipboard.writeText(fullText);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  }, [fortuneReading]); // Only recreate when fortuneReading changes

  // Redirect unauthenticated users
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading]);

  // Generate fortune reading
  useEffect(() => {
    // Prevent re-running if already loading or complete
    if (loadingState !== 'initializing') {
      return;
    }

    // Wait for session to load
    if (!session || sessionLoading) {
      return;
    }

    async function generateFortune() {
      console.log('[FortuneDetail] Session loaded, generating fortune for user:', session?.user?.id);

      try {
        // Check if user has birth data in the onboarding store
        const hasStoreData = profile.name && profile.birthDate && profile.gender;

        // Step 1: Save birth profile (only if coming from onboarding flow)
        if (hasStoreData) {
          setLoadingState('saving-profile');
          await api.post('/fortune/profile', profile);
        }

        // Step 2: Fetch chart data
        setLoadingState('generating-chart');

        // Step 3: Generate full reading with narrative
        setLoadingState('generating-narrative');
        const reading = await api.get<FortuneReading>('/fortune/chart');

        setFortuneReading(reading);

        // Simulate streaming effect by breaking narrative into chunks
        // In a real implementation, this would use SSE or streaming API
        const words = reading.narrative.split(' ');
        const chunkSize = 3; // Words per chunk
        const chunks: string[] = [];

        for (let i = 0; i < words.length; i += chunkSize) {
          chunks.push(words.slice(i, i + chunkSize).join(' '));
        }

        // Progressive reveal
        for (let i = 0; i < chunks.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setNarrativeChunks(prev => [...prev, chunks[i]]);
        }

        setLoadingState('complete');

        // Mark onboarding as complete
        await api.post('/api/onboarding/complete', {});
      } catch (err: any) {
        console.error('Fortune generation error:', err);

        // If not authenticated, redirect to login
        if (err?.status === 401) {
          console.log('Not authenticated, redirecting to /login');
          router.push('/login');
          return;
        }

        // If user doesn't have a birth profile (404) or validation error (422)
        // redirect them to complete onboarding
        if (err?.status === 404 || err?.status === 422) {
          console.log('Birth profile not found or invalid, redirecting to /fortune');
          router.push('/fortune');
          return;
        }

        setError('ไม่สามารถสร้างดวงชะตาได้ กรุณาลองใหม่อีกครั้ง');
        setLoadingState('complete');
      }
    }

    generateFortune();
    // Dependencies: Only run when session becomes available
    // - session: needed to know when user is authenticated
    // - sessionLoading: needed to wait for auth check to complete
    // - loadingState: indirectly checked via guard above, but not in deps to avoid re-runs
    // - profile: read from store but not a dependency - we read latest value when effect runs
    // - router: stable reference from Next.js, not needed in deps
  }, [session, sessionLoading]);

  // Loading skeleton
  if (sessionLoading || !session || loadingState !== 'complete') {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          {/* Header Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 md:space-y-4"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-8 md:h-10 bg-darkPurple/50 rounded-lg w-3/4 mx-auto"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="h-4 md:h-5 bg-darkPurple/30 rounded-lg w-1/2 mx-auto"
            />
          </motion.div>

          {/* Status Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 border-4 border-royalPurple border-t-transparent rounded-full animate-spin"
            />
            <p className="text-paleOrchid font-oracle text-base md:text-lg">
              {loadingState === 'saving-profile' && 'กำลังบันทึกข้อมูลของเจ้า...'}
              {loadingState === 'generating-chart' && 'กำลังคำนวณดวงชะตา...'}
              {loadingState === 'generating-narrative' && 'กำลังมองเห็นอนาคตของเจ้า...'}
              {loadingState === 'initializing' && 'กำลังเตรียมการ...'}
            </p>
          </motion.div>

          {/* Four Pillars Skeleton */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-darkPurple to-deepNight">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-6 bg-royalPurple/30 rounded w-1/3 mx-auto"
              />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-deepNight border border-darkPurple rounded-lg p-3 md:p-4 space-y-2"
                  >
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                      className="h-3 bg-darkPurple/50 rounded w-2/3 mx-auto"
                    />
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 + 0.2 }}
                      className="h-6 bg-amethyst/30 rounded w-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 + 0.4 }}
                      className="h-6 bg-ghostWhite/20 rounded w-full"
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Narrative Skeleton */}
          <Card>
            <CardHeader>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-6 bg-royalPurple/30 rounded w-1/2"
              />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                    className="h-4 bg-ghostWhite/10 rounded w-full"
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <p className="text-ghostWhite font-oracle">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-md transition-colors font-heading"
            >
              กลับสู่หน้าหลัก
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 md:space-y-3"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading text-ghostWhite">
            ดวงชะตาของเจ้า
          </h1>
          <p className="text-sm md:text-base text-ashGray font-oracle">
            {session.user.name || 'ผู้มาเยือน'}
          </p>
        </motion.div>

        {/* Teaser Result Summary */}
        {teaserResult.elementType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-darkPurple to-deepNight border-royalPurple/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-3 md:space-y-4">
                  <p className="text-xs md:text-sm text-paleOrchid/80 uppercase tracking-wider">
                    องค์ประกอบหลัก
                  </p>
                  <p className="text-3xl md:text-4xl lg:text-5xl font-heading text-amethyst capitalize">
                    {teaserResult.elementType}
                  </p>
                  {(teaserResult.luckyColor || teaserResult.luckyNumber) && (
                    <div className="flex gap-4 md:gap-6 justify-center pt-2">
                      {teaserResult.luckyColor && (
                        <div className="text-center">
                          <p className="text-xs text-ashGray mb-1">สีมงคล</p>
                          <p className="text-sm md:text-base text-ghostWhite">{teaserResult.luckyColor}</p>
                        </div>
                      )}
                      {teaserResult.luckyNumber && (
                        <div className="text-center">
                          <p className="text-xs text-ashGray mb-1">เลขมงคล</p>
                          <p className="text-sm md:text-base text-ghostWhite">{teaserResult.luckyNumber}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Four Pillars Chart */}
        {fortuneReading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="bg-gradient-to-br from-darkPurple to-deepNight">
                <CardTitle className="text-center text-base md:text-lg">
                  สี่เสาชะตา (Four Pillars)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { label: 'ปี', pillar: fortuneReading.baziChart.yearPillar },
                    { label: 'เดือน', pillar: fortuneReading.baziChart.monthPillar },
                    { label: 'วัน', pillar: fortuneReading.baziChart.dayPillar },
                    { label: 'ชั่วโมง', pillar: fortuneReading.baziChart.hourPillar },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="bg-deepNight border border-darkPurple rounded-lg p-3 md:p-4 text-center space-y-2"
                    >
                      <p className="text-xs text-ashGray">{item.label}</p>
                      {item.pillar ? (
                        <div className="space-y-1">
                          <p className="text-base md:text-lg font-heading text-amethyst">
                            {item.pillar.stem}
                          </p>
                          <p className="text-base md:text-lg font-heading text-ghostWhite">
                            {item.pillar.branch}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-ashGray/50 italic">ไม่ทราบ</p>
                      )}
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 p-4 bg-darkPurple/30 rounded-lg text-center"
                >
                  <p className="text-xs md:text-sm text-ashGray mb-1">จุ๊ของเจ้า (Day Master)</p>
                  <p className="text-2xl md:text-3xl font-heading text-royalPurple capitalize">
                    {fortuneReading.baziChart.dayMaster} ({fortuneReading.baziChart.element})
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Thai Astrology */}
        {fortuneReading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">โหราศาสตร์ไทย</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-center">
                  <div>
                    <p className="text-xs text-ashGray mb-1">วันเกิด</p>
                    <p className="text-sm md:text-base text-ghostWhite font-oracle">
                      {fortuneReading.thaiAstrology.day}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ashGray mb-1">ดาวประจำวัน</p>
                    <p className="text-sm md:text-base text-ghostWhite font-oracle">
                      {fortuneReading.thaiAstrology.planet}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ashGray mb-1">ทิศมงคล</p>
                    <p className="text-sm md:text-base text-ghostWhite font-oracle">
                      {fortuneReading.thaiAstrology.luckyDirection}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full Narrative - Streaming */}
        {fortuneReading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">คำทำนายโดยละเอียด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 font-oracle font-light text-sm md:text-base text-ghostWhite/90 leading-relaxed">
                  <AnimatePresence>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {narrativeChunks.join(' ')}
                      {narrativeChunks.length < fortuneReading.narrative.split(' ').length && (
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-1 h-4 bg-amethyst ml-1"
                        />
                      )}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-3 md:py-4 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-lg transition-all font-heading text-sm md:text-base"
          >
            ไปยังแดชบอร์ด
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 md:py-4 border-2 border-darkPurple hover:border-amethyst text-ghostWhite rounded-lg transition-all font-heading text-sm md:text-base relative"
          >
            {shareStatus === 'copied' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                คัดลอกแล้ว!
              </span>
            ) : (
              'แชร์ดวงชะตา'
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
