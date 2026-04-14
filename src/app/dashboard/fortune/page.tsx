'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
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
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { FortuneTabBar, type FortuneTab } from '@/components/chart/fortune-tab-bar';
import { CompatibilityCTA } from '@/components/chart/compatibility-cta';
import { ScrollIndicator } from '@/components/ui/scroll-indicator';
import { AutoDonationModal, DonationModal } from '@/components/ads/donation-modal';
import { DonationButton } from '@/components/ads/donation-button';
import { ELEMENT_COLORS } from '@/lib-packages/shared/constants/design';

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
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<FortuneTab>('fortune');
  const [showProfileUpdatedToast, setShowProfileUpdatedToast] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // State management
  const { loadingState, error, rateLimitResetAt, setShareStatus } = useFortuneStore();

  // If user just updated their profile in settings, invalidate cached chart data
  // so useFortuneGeneration re-fetches (and triggers LLM regeneration)
  useEffect(() => {
    const profileUpdated = sessionStorage.getItem('fortune-profile-updated');
    if (profileUpdated) {
      sessionStorage.removeItem('fortune-profile-updated');
      // Clear all fortune-related cached data so it re-fetches with new profile
      // Uses prefix match to clear ['fortune', 'chart', userId] regardless of userId
      queryClient.removeQueries({ queryKey: ['fortune'] });
      // Reset fortune store so generation hook runs again
      useFortuneStore.getState().reset();
      setShowProfileUpdatedToast(true);
      setTimeout(() => setShowProfileUpdatedToast(false), 5000);
    }
  }, [queryClient]);

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

  // Handle share action - open ShareSheet
  const handleShare = () => {
    setShowShareSheet(true);
  };

  // Show loading skeleton while initializing or generating
  if (sessionLoading || !session || loadingState !== 'complete') {
    return <LoadingSkeleton loadingState={loadingState} />;
  }

  // Show error state
  if (error) {
    return <ErrorDisplay error={error} showRetry />;
  }

  // Show rate limit screen when no cached data available
  if (rateLimitResetAt && !chartData) {
    const resetDate = new Date(rateLimitResetAt);
    const now = new Date();
    const diffMs = resetDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const timeText = diffHours <= 1 ? 'ไม่นานนี้' : `ในอีก ${diffHours} ชั่วโมง`;

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-900/20 border border-amber-500/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-heading text-ghostWhite">แก้ไขข้อมูลบ่อยเกินไป</h2>
            <p className="text-sm text-ashGray">
              ดวงของคุณจะอัปเดตใหม่ได้{timeText}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard/today')}
              className="px-6 py-2.5 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-lg transition-colors font-heading text-sm"
            >
              กลับหน้าหลัก
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 border border-royalPurple/50 text-ashGray hover:text-ghostWhite rounded-lg transition-colors font-heading text-sm"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen pb-4 relative">
      {/* Scroll Indicator - Bottom Center */}
      <ScrollIndicator />

      {/* Rate Limit Banner */}
      <AnimatePresence>
        {rateLimitResetAt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto px-4 pt-6"
          >
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-900/20 border border-amber-500/30 text-amber-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                คุณแก้ไขข้อมูลบ่อยเกินไป ดวงจะอัปเดตใหม่ได้อีกครั้งใน{' '}
                {(() => {
                  const resetDate = new Date(rateLimitResetAt);
                  const now = new Date();
                  const diffMs = resetDate.getTime() - now.getTime();
                  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
                  if (diffHours <= 1) return 'ไม่นานนี้';
                  return `${diffHours} ชั่วโมง`;
                })()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Updated Toast */}
      <AnimatePresence>
        {showProfileUpdatedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto px-4 pt-6"
          >
            <div className="p-4 rounded-lg bg-royalPurple/20 border border-royalPurple/30 text-amethyst text-sm">
              กำลังอัปเดตดวงตามข้อมูลใหม่...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Donation reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-ashGray mb-3">ชอบดวงของเจ้าไหม?</p>
          <DonationButton onClick={() => setShowDonationModal(true)}>
            ☕ สนับสนุนพี่ภู
          </DonationButton>
        </motion.div>
      </div>

      {/* Auto-open donation modal */}
      <AutoDonationModal />

      {/* User-triggered donation modal */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        showDismissForever={false}
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
