'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useFortuneGeneration } from '@/features/fortune/hooks/use-fortune-generation';
import { useFortuneData } from '@/features/fortune/hooks/use-fortune-data';
import { useFortuneStore } from '@/stores/fortune';
import { LoadingSkeleton } from '@/features/fortune/loading-skeleton';
import { useMinLoading } from '@/hooks/use-min-loading';
import { ErrorDisplay } from '@/features/fortune/error-display';
import { ElementProfileSection } from '@/features/fortune/chart/element-profile-section';
import { FourPillarsSection } from '@/features/fortune/chart/four-pillars-section';
import { BirthStarSection } from '@/features/fortune/chart/birth-star-section';
import { FortuneReadingsSection } from '@/features/fortune/chart/fortune-readings-section';
import { RecommendationsSection } from '@/features/fortune/chart/recommendations-section';
import { FortuneResultHeader } from '@/features/fortune/chart/fortune-result-header';
import { FortuneOverviewSection } from '@/features/fortune/chart/fortune-overview-section';
import { ResultDisclosure } from '@/features/fortune/chart/result-disclosure';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { FortuneTabBar, fortuneTabId, type FortuneTab } from '@/features/fortune/chart/fortune-tab-bar';
import { ReadNext, READ_NEXT_OVERVIEW, READ_NEXT_READINGS, READ_NEXT_DETAILS } from '@/features/fortune/chart/read-next';

const ELEMENT_NAMES = {
  earth: 'ธาตุดิน',
  fire: 'ธาตุไฟ',
  water: 'ธาตุน้ำ',
  wood: 'ธาตุไม้',
  metal: 'ธาตุทอง',
} as const;

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
  const [activeTab, setActiveTab] = useState<FortuneTab>('overview');
  const [showProfileUpdatedToast, setShowProfileUpdatedToast] = useState(false);

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

  const handleTabChange = (tab: FortuneTab) => {
    setActiveTab(tab);
    window.requestAnimationFrame(() => {
      document.getElementById('fortune-content')?.scrollIntoView({ block: 'start' });
    });
  };

  // Show loading skeleton while initializing or generating
  // Floor the loader at 3s even on a cache hit; the skeleton keeps rotating
  // copy while loadingState is already 'complete'.
  const holdLoader = useMinLoading(loadingState !== 'complete');

  if (sessionLoading || !session || holdLoader) {
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
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-warn/10 border border-warn/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-warn" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-heading text-ink">แก้ไขข้อมูลบ่อยเกินไป</h2>
            <p className="text-sm text-inkMuted">
              ดวงจะอัปเดตใหม่ได้{timeText}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard/today')}
              className="px-6 py-2.5 bg-accent hover:bg-accentBright text-accentInk rounded-lg transition-colors font-heading text-sm"
            >
              กลับหน้าหลัก
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 border border-accent/50 text-inkMuted hover:text-ink rounded-lg transition-colors font-heading text-sm"
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

  const userName = (session.user as any).displayName || session.user.name;
  const element = chartData.elementProfile.primaryElement;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] pb-12">

      {/* Rate Limit Banner */}
      <AnimatePresence>
        {rateLimitResetAt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto px-4 pt-6"
          >
            <div className="flex items-start gap-3 p-4 rounded-lg bg-warn/10 border border-warn/30 text-warn text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                เปลี่ยนข้อมูลบ่อยเกินไป ดวงจะอัปเดตใหม่ได้อีกครั้งใน{' '}
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
            <div className="p-4 rounded-lg bg-accent/20 border border-accent/30 text-accentBright text-sm">
              กำลังอัปเดตดวงตามข้อมูลใหม่...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <FortuneResultHeader
            personalityTraits={chartData.personalityTraits}
            birthDateFormatted={chartData.birthDateFormatted}
            currentAge={chartData.currentAge}
            userName={userName}
            element={element}
            elementName={ELEMENT_NAMES[element]}
            corePersonality={chartData.elementProfile.corePersonality}
            onShare={handleShare}
          />
        </motion.div>
      </div>

      {/* Tab Navigation - Sticky when scrolled past */}
      <FortuneTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div id="fortune-content" className="mx-auto max-w-4xl scroll-mt-28 px-4 py-8 sm:py-10">
        {activeTab === 'overview' && (
          <motion.div
            id="fortune-panel-overview"
            role="tabpanel"
            aria-labelledby={fortuneTabId('overview')}
            tabIndex={0}
            initial={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <FortuneOverviewSection
              fortuneReadings={chartData.fortuneReadings}
              recommendations={chartData.recommendations}
              birthStar={chartData.birthStar}
              onOpenReadings={() => handleTabChange('readings')}
            />
            <div className="mt-12">
              <ReadNext items={READ_NEXT_OVERVIEW} onTabChange={handleTabChange} />
            </div>
          </motion.div>
        )}

        {activeTab === 'readings' && (
          <motion.div
            id="fortune-panel-readings"
            role="tabpanel"
            aria-labelledby={fortuneTabId('readings')}
            tabIndex={0}
            initial={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-12"
          >
            <FortuneReadingsSection fortuneReadings={chartData.fortuneReadings} />
            <ReadNext items={READ_NEXT_READINGS} onTabChange={handleTabChange} />
          </motion.div>
        )}

        {activeTab === 'details' && (
          <motion.div
            id="fortune-panel-details"
            role="tabpanel"
            aria-labelledby={fortuneTabId('details')}
            tabIndex={0}
            initial={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">แผนผังชีวิตของเจ้า</h2>
              <p className="mt-2 font-thai text-inkMuted">รายละเอียดทั้งหมดอยู่ตรงนี้ แต่ไม่จำเป็นต้องอ่านรวดเดียว</p>
            </div>
            <div className="border-t border-edge">
              <ResultDisclosure title="รู้จักธาตุของเจ้า" description="จุดแข็ง จุดอ่อน และธาตุที่เข้ากัน">
                <ElementProfileSection elementProfile={chartData.elementProfile} />
              </ResultDisclosure>
              <ResultDisclosure title="จังหวะและฤกษ์มงคล" description="ดูคำแนะนำ สี เลข ทิศ และเดือนเด่น">
                <RecommendationsSection recommendations={chartData.recommendations} />
              </ResultDisclosure>
              <ResultDisclosure title="เสาชะตาทั้งสี่" description="เปิดดูข้อมูลโหราศาสตร์และปาจื้อเบื้องหลังคำทำนาย">
                <div className="space-y-12">
                  <FourPillarsSection
                    pillars={chartData.pillars}
                    pillarInterpretations={chartData.pillarInterpretations}
                    pillarInteractions={chartData.pillarInteractions}
                  />
                  <BirthStarSection birthStar={chartData.birthStar} />
                </div>
              </ResultDisclosure>
            </div>
            <div className="mt-12">
              <ReadNext items={READ_NEXT_DETAILS} onTabChange={handleTabChange} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Share Sheet */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareData={{
          url: `${SITE_URL}/dashboard/fortune`,
          userName,
          element: chartData.elementProfile.primaryElement,
          luckyColor: chartData.birthStar.luckyColor,
          luckyNumber: chartData.birthStar.luckyNumber,
        }}
      />
    </div>
  );
}
