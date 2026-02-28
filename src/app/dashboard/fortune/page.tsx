'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useFortuneGeneration } from '@/hooks/use-fortune-generation';
import { useFortuneData } from '@/hooks/use-fortune-data';
import { useFortuneStore } from '@/stores/fortune';
import { LoadingSkeleton } from '@/components/fortune/loading-skeleton';
import { ErrorDisplay } from '@/components/fortune/error-display';
import { HeroSection } from '@/components/chart/hero-section';
import { ElementProfileSection } from '@/components/chart/element-profile-section';
import { FourPillarsSection } from '@/components/chart/four-pillars-section';
import { BirthStarSection } from '@/components/chart/birth-star-section';
import { FortuneReadingsSection } from '@/components/chart/fortune-readings-section';
import { RecommendationsSection } from '@/components/chart/recommendations-section';
import { StickyActionBar } from '@/components/chart/sticky-action-bar';
import { ELEMENT_COLORS } from '@/lib-packages/shared/constants/design';
import { api } from '@/lib/api';

/**
 * Fortune Chart Page (Redesigned Dashboard)
 *
 * This page shows the complete structured fortune chart with:
 * - Hero identity card with personality traits
 * - Element profile with strengths/weaknesses/compatibility
 * - Interactive four pillars with expandable details
 * - Birth star attributes with tooltips
 * - 6 fortune reading categories (auto-expand life overview)
 * - Recommendations with monthly highlights and do's/don'ts
 * - Sticky action bar for sharing and creating new reading
 *
 * Architecture:
 * - useFortuneGeneration: Orchestrates fortune generation flow
 * - useFortuneData: React Query hook for fetching StructuredChartResponse
 * - Staggered fade-in animations (100ms delay between sections)
 * - Mobile-first responsive design
 */
export default function FortuneChartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);

  // State management
  const { loadingState, error, setShareStatus } = useFortuneStore();

  // Session validation and fortune generation
  const { session, sessionLoading } = useFortuneGeneration();

  // Fortune data fetching
  const { data: chartData } = useFortuneData(loadingState === 'complete');

  // Redirect unauthenticated users
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  // Handle share action
  const handleShare = async () => {
    setShareStatus('copying');
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: 'ดวงชะตาของฉัน',
          text: 'มาดูดวงชะตาของฉันกันเถอะ!',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
      setShareStatus('idle');
    }
  };

  // Handle new reading action - regenerate with same birth data
  const handleNewReading = async () => {
    if (isRegenerating) return;

    try {
      setIsRegenerating(true);

      // Call backend to clear cache and regenerate
      await api.delete('/fortune/chart/regenerate');

      // Invalidate and refetch the chart data
      await queryClient.invalidateQueries({ queryKey: ['fortune', 'chart'] });

      console.log('[FortuneChart] Successfully regenerated new reading');
    } catch (err) {
      console.error('[FortuneChart] Regenerate failed:', err);
      // Fallback: redirect to onboarding if regenerate fails
      router.push('/fortune');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Show loading skeleton while initializing or generating
  if (sessionLoading || !session || loadingState !== 'complete') {
    return <LoadingSkeleton loadingState={loadingState} />;
  }

  // Show error state
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Show main content
  if (!chartData) {
    return <LoadingSkeleton loadingState={loadingState} />;
  }

  const elementColor = ELEMENT_COLORS[chartData.elementProfile.primaryElement]?.primary;

  const sections = [
    { key: 'hero', component: HeroSection, delay: 0 },
    { key: 'element', component: ElementProfileSection, delay: 100 },
    { key: 'pillars', component: FourPillarsSection, delay: 200 },
    { key: 'birthstar', component: BirthStarSection, delay: 300 },
    { key: 'readings', component: FortuneReadingsSection, delay: 400 },
    { key: 'recommendations', component: RecommendationsSection, delay: 500 },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Section 1: Hero */}
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0 }}
        >
          <HeroSection
            personalityTraits={chartData.personalityTraits}
            birthDateFormatted={chartData.birthDateFormatted}
            currentAge={chartData.currentAge}
            userName={session.user.name}
            elementAccent={elementColor}
          />
        </motion.div>

        {/* Section 2: Element Profile */}
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        >
          <ElementProfileSection elementProfile={chartData.elementProfile} />
        </motion.div>

        {/* Section 3: Four Pillars */}
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
        >
          <FourPillarsSection
            pillars={chartData.pillars}
            pillarInterpretations={chartData.pillarInterpretations}
            pillarInteractions={chartData.pillarInteractions}
          />
        </motion.div>

        {/* Section 4: Birth Star */}
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
        >
          <BirthStarSection birthStar={chartData.birthStar} />
        </motion.div>

        {/* Section 5: Fortune Readings */}
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }}
        >
          <FortuneReadingsSection fortuneReadings={chartData.fortuneReadings} />
        </motion.div>

        {/* Section 6: Recommendations */}
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
        >
          <RecommendationsSection recommendations={chartData.recommendations} />
        </motion.div>
      </div>

      {/* Sticky Action Bar */}
      <StickyActionBar
        onShare={handleShare}
        onNewReading={handleNewReading}
        isRegenerating={isRegenerating}
      />
    </div>
  );
}
