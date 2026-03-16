'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

import { useDailyFortune, useUserProfile } from '@/hooks/use-daily-fortune';
import { LoadingSkeleton } from '@/components/fortune/loading-skeleton';
import { ErrorDisplay } from '@/components/fortune/error-display';
import { IdentityAnchor } from '@/components/today/identity-anchor';
import { DailyReadingCard } from '@/components/today/daily-reading-card';
import { CategoryScores } from '@/components/today/category-scores';
import { LuckyBadges } from '@/components/today/lucky-badges';
import { DailyGuidance } from '@/components/today/daily-guidance';
import { DailyWarnings } from '@/components/today/daily-warnings';
import { DailySuggestions } from '@/components/today/daily-suggestions';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { PawjaiAdsBanner } from '@/components/ads/pawjai-ads-banner';

/**
 * Daily Fortune Page - /dashboard/today
 *
 * A focused, personalized daily fortune experience.
 * Uses real API data for structured daily reading with:
 * - User identity context (element, planet)
 * - AI-generated reading with category scores
 * - Lucky attributes from Thai + Chinese astrology + MBTI
 * - Daily dos/donts guidance
 * - Warnings and personalized suggestions
 * - Share functionality
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
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Section A: Identity Anchor */}
        <IdentityAnchor
          displayName={displayName}
          primaryElement={primaryElement}
          planet={planet}
        />

        {/* Section B: Today's Reading */}
        {structured?.overallReading && (
          <DailyReadingCard
            overallReading={structured.overallReading}
            primaryElement={primaryElement}
          />
        )}

        {/* Section C: Category Scores */}
        {structured?.categories && (
          <CategoryScores categories={structured.categories} />
        )}

        <PawjaiAdsBanner />

        {/* Section D: Lucky Attributes */}
        <LuckyBadges
          luckyNumber={dailyReading?.luckyNumber ?? null}
          luckyColor={dailyReading?.luckyColor ?? null}
          luckyDirection={dailyReading?.luckyDirection ?? null}
          luckyMoment={structured?.luckyMoment ?? null}
          luckyNumbers={structured?.luckyNumbers ?? null}
          luckyColorEnhanced={structured?.luckyColor ?? null}
        />

        {/* Section E: Daily Guidance */}
        {structured?.dos && structured?.donts && (
          <DailyGuidance dos={structured.dos} donts={structured.donts} />
        )}

        {/* Section F: Warnings */}
        {structured?.warnings && structured.warnings.length > 0 && (
          <DailyWarnings warnings={structured.warnings} />
        )}

        {/* Section G: Suggestions */}
        {structured?.suggestions && structured.suggestions.length > 0 && (
          <DailySuggestions suggestions={structured.suggestions} />
        )}

        {/* Section H: Share Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => setShowShareSheet(true)}
            className="w-full py-3 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-lg transition-colors font-heading"
          >
            แชร์ดวงวันนี้ของเจ้า
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
