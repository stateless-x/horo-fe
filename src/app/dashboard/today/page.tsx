'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Sparkles, Gem, Compass, Share2 } from 'lucide-react';

import { useDailyFortune, useUserProfile } from '@/hooks/use-daily-fortune';
import { LoadingSkeleton } from '@/components/fortune/loading-skeleton';
import { ErrorDisplay } from '@/components/fortune/error-display';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/lib-packages/ui';
import { TodayHero } from '@/components/today/today-hero';
import { DailyReadingCard } from '@/components/today/daily-reading-card';
import { CategoryCarousel } from '@/components/today/category-carousel';
import { LuckyPanel } from '@/components/today/lucky-panel';
import { GuidancePanel } from '@/components/today/guidance-panel';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { PawjaiAdsBanner } from '@/components/ads/pawjai-ads-banner';

/**
 * Daily Fortune Page - /dashboard/today
 *
 * A focused, personalized daily fortune experience with tab-based navigation.
 *
 * Layout:
 * - Hero: Condensed identity + daily score + theme
 * - Tabs: Overview | Lucky | Guidance
 * - Share button
 *
 * Protected route - requires authentication + completed onboarding
 */
export default function TodayPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace('/login');
    }
  }, [session, sessionLoading, router]);

  const isReady = !!session;

  // Hooks must be called unconditionally — use `enabled` to gate fetching
  const {
    data: dailyReading,
    isLoading: dailyLoading,
    error: dailyError,
  } = useDailyFortune(isReady);

  const { data: userProfile } = useUserProfile(isReady);

  // Block render until session is resolved — prevents flash of content before redirect
  if (sessionLoading || !session) {
    return <LoadingSkeleton isLoading />;
  }

  // Loading state for daily reading data
  if (dailyLoading) {
    return <LoadingSkeleton isLoading />;
  }

  // Error state
  if (dailyError) {
    return <ErrorDisplay error="ไม่สามารถโหลดดวงชะตาวันนี้ได้" showRetry />;
  }

  const displayName =
    userProfile?.user?.displayName ||
    (session.user as any)?.displayName ||
    session.user.name ||
    'เจ้า';
  const primaryElement = userProfile?.astrology?.primaryElement || dailyReading?.elementEnergy || null;
  const planet = userProfile?.astrology?.planet || null;
  const structured = dailyReading?.structuredContent;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Hero Section - always visible */}
        <TodayHero
          displayName={displayName}
          primaryElement={primaryElement}
          planet={planet}
          dailyTheme={structured?.dailyTheme}
          overallScore={structured?.overallScore}
        />

        {/* Tab Navigation */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview" icon={<Sparkles className="w-4 h-4" />}>
              ภาพรวม
            </TabsTrigger>
            <TabsTrigger value="lucky" icon={<Gem className="w-4 h-4" />}>
              โชคลาภ
            </TabsTrigger>
            <TabsTrigger value="guidance" icon={<Compass className="w-4 h-4" />}>
              คำแนะนำ
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-4">
              {/* Daily Reading */}
              {structured?.overallReading && (
                <DailyReadingCard
                  overallReading={structured.overallReading}
                  primaryElement={primaryElement}
                />
              )}

              {/* Category Scores - horizontal carousel */}
              {structured?.categories && (
                <CategoryCarousel categories={structured.categories} />
              )}

              {/* Ad placement in overview tab */}
              <PawjaiAdsBanner />
            </div>
          </TabsContent>

          {/* Lucky Tab */}
          <TabsContent value="lucky">
            <LuckyPanel
              luckyNumber={dailyReading?.luckyNumber ?? null}
              luckyColor={dailyReading?.luckyColor ?? null}
              luckyDirection={dailyReading?.luckyDirection ?? null}
              luckyMoment={structured?.luckyMoment ?? null}
              luckyNumbers={structured?.luckyNumbers ?? null}
              luckyColorEnhanced={structured?.luckyColor ?? null}
            />
          </TabsContent>

          {/* Guidance Tab */}
          <TabsContent value="guidance">
            {structured?.dos && structured?.donts && (
              <GuidancePanel
                dos={structured.dos}
                donts={structured.donts}
                warnings={structured.warnings}
                suggestions={structured.suggestions}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Share Button - fixed at bottom on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-2"
        >
          <button
            onClick={() => setShowShareSheet(true)}
            className="w-full py-3 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-xl transition-colors font-heading flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            แชร์ดวงวันนี้
          </button>
        </motion.div>

        {/* ShareSheet */}
        <ShareSheet
          isOpen={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          shareData={{
            url: `${SITE_URL}/dashboard/today`,
            userName: displayName,
            element: primaryElement || undefined,
            luckyColor: structured?.luckyColor || dailyReading?.luckyColor || undefined,
            luckyNumber: dailyReading?.luckyNumber || undefined,
          }}
        />
      </div>
    </div>
  );
}
