'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Settings, RefreshCw } from 'lucide-react';
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
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { FortuneTabBar, type FortuneTab } from '@/components/chart/fortune-tab-bar';
import { CompatibilityCTA } from '@/components/chart/compatibility-cta';
import { ScrollIndicator } from '@/components/ui/scroll-indicator';
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
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<FortuneTab>('fortune');

  // State management
  const { loadingState, error, setShareStatus } = useFortuneStore();

  // Session validation and fortune generation
  const { session, sessionLoading } = useFortuneGeneration();

  // Fortune data fetching
  const { data: chartData, isRefetching } = useFortuneData(loadingState === 'complete');

  // Redirect unauthenticated users
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  // Handle share action - open ShareSheet
  const handleShare = () => {
    setShowShareSheet(true);
  };

  // Handle new reading action - regenerate with same birth data
  const handleNewReading = async () => {
    if (isRegenerating || isRefetching) return;

    try {
      setIsRegenerating(true);

      // Call backend to clear cache and regenerate
      await api.delete('/api/fortune/chart/regenerate');

      // Invalidate and refetch the chart data
      await queryClient.refetchQueries({ queryKey: ['fortune', 'chart'] });

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
    <div className="min-h-screen pb-24 relative">
      {/* Regeneration Overlay */}
      {isRefetching && (
        <div className="fixed inset-0 bg-voidBlack/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-deepNight/90 border border-royalPurple/50 rounded-2xl px-8 py-6 flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 text-amethyst animate-spin" />
            <p className="text-ghostWhite font-heading text-lg">กำลังสร้างดวงใหม่...</p>
            <p className="text-ashGray text-sm">โปรดรอสักครู่</p>
          </div>
        </div>
      )}

      {/* Scroll Indicator - Bottom Center */}
      <ScrollIndicator />

      {/* Settings Icon - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => router.push('/dashboard/settings')}
          className="w-12 h-12 rounded-full bg-deepNight/80 backdrop-blur-sm border border-royalPurple/30 flex items-center justify-center hover:bg-royalPurple/20 hover:border-amethyst/50 transition-all duration-300 group"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-ashGray group-hover:text-amethyst transition-colors" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Section 1: Hero - Always visible */}
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0 }}
        >
          <HeroSection
            personalityTraits={chartData.personalityTraits}
            birthDateFormatted={chartData.birthDateFormatted}
            currentAge={chartData.currentAge}
            userName={(session.user as any).displayName || session.user.name}
            elementAccent={elementColor}
          />
        </motion.div>

        {/* Section 2: Element Profile - Always visible */}
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        >
          <ElementProfileSection elementProfile={chartData.elementProfile} />
        </motion.div>
      </div>

      {/* Tab Navigation - Sticky when scrolled past */}
      <FortuneTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Tab 1: Fortune Readings */}
        {activeTab === 'fortune' && (
          <motion.div
            initial={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-8"
          >
            <FortuneReadingsSection fortuneReadings={chartData.fortuneReadings} />
            <CompatibilityCTA />
          </motion.div>
        )}

        {/* Tab 2: Four Pillars + Birth Star */}
        {activeTab === 'pillars' && (
          <motion.div
            initial={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-8"
          >
            <FourPillarsSection
              pillars={chartData.pillars}
              pillarInterpretations={chartData.pillarInterpretations}
              pillarInteractions={chartData.pillarInteractions}
            />
            <BirthStarSection birthStar={chartData.birthStar} />
          </motion.div>
        )}

        {/* Tab 3: Recommendations */}
        {activeTab === 'recommendations' && (
          <motion.div
            initial={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <RecommendationsSection recommendations={chartData.recommendations} />
          </motion.div>
        )}
      </div>

      {/* Sticky Action Bar */}
      <StickyActionBar
        onShare={handleShare}
        onNewReading={handleNewReading}
        isRegenerating={isRegenerating || isRefetching}
      />

      {/* Share Sheet */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareData={{
          url: `${SITE_URL}/dashboard/fortune`,
          userName: (session.user as any).displayName || session.user.name,
          element: chartData.elementProfile.primaryElement,
          luckyColor: chartData.birthStar.luckyColor,
          luckyNumber: chartData.birthStar.luckyNumber,
        }}
      />
    </div>
  );
}
