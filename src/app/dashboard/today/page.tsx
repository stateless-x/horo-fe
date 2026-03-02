'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Orbit, Heart } from 'lucide-react';

import { useDailyFortune, useUserProfile } from '@/hooks/use-daily-fortune';
import { IdentityAnchor } from '@/components/today/identity-anchor';
import { DailyReadingCard } from '@/components/today/daily-reading-card';
import { CategoryScores } from '@/components/today/category-scores';
import { LuckyBadges } from '@/components/today/lucky-badges';
import { DailyGuidance } from '@/components/today/daily-guidance';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { Card } from '@/lib-packages/ui';

/**
 * Daily Fortune Page - /dashboard/today
 *
 * A focused, personalized daily fortune experience.
 * Uses real API data for structured daily reading with:
 * - User identity context (element, planet)
 * - AI-generated reading with category scores
 * - Lucky attributes from Thai + Chinese astrology
 * - Daily dos/donts guidance
 * - Share functionality
 *
 * Protected route - requires authentication + completed onboarding
 */
export default function TodayPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Redirect logic
  useEffect(() => {
    if (!sessionLoading) {
      if (!session) {
        router.push('/login');
      } else if (!(session.user as any)?.onboardingCompleted) {
        router.push('/dashboard/fortune');
      }
    }
  }, [session, sessionLoading, router]);

  const isReady = !!session && !!(session.user as any)?.onboardingCompleted;

  const {
    data: dailyReading,
    isLoading: dailyLoading,
    error: dailyError,
  } = useDailyFortune(isReady);

  const { data: userProfile } = useUserProfile(isReady);

  // Loading state
  if (sessionLoading || dailyLoading || !session) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-16 h-16 border-4 border-royalPurple border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  // Error state
  if (dailyError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-ashGray font-thai">
            ไม่สามารถโหลดดวงชะตาวันนี้ได้
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-lg transition-colors font-heading"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
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

        {/* Section D: Lucky Attributes */}
        <LuckyBadges
          luckyNumber={dailyReading?.luckyNumber ?? null}
          luckyColor={dailyReading?.luckyColor ?? null}
          luckyDirection={dailyReading?.luckyDirection ?? null}
          luckyMoment={structured?.luckyMoment ?? null}
        />

        {/* Section E: Daily Guidance */}
        {structured?.dos && structured?.donts && (
          <DailyGuidance dos={structured.dos} donts={structured.donts} />
        )}

        {/* Section F: Share Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => setShowShareSheet(true)}
            className="w-full py-3 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-lg transition-colors font-heading"
          >
            แชร์ดวงวันนี้ของเจ้า
          </button>
        </motion.div>

        {/* Section G: Cross Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 gap-3"
        >
          <Link href="/dashboard/fortune">
            <Card className="p-5 text-center hover:border-royalPurple transition-colors cursor-pointer">
              <Orbit className="w-8 h-8 text-amethyst mx-auto mb-2" />
              <h3 className="font-heading text-ghostWhite text-sm">
                ดูดวงแบบเต็ม
              </h3>
              <p className="text-xs text-ashGray mt-1">ดวงชะตาตลอดชีวิต</p>
            </Card>
          </Link>

          <Link href="/dashboard/compatibility">
            <Card className="p-5 text-center hover:border-royalPurple transition-colors cursor-pointer">
              <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <h3 className="font-heading text-ghostWhite text-sm">ดูดวงคู่</h3>
              <p className="text-xs text-ashGray mt-1">เช็คความเข้ากันได้</p>
            </Card>
          </Link>
        </motion.div>

        {/* ShareSheet */}
        <ShareSheet
          isOpen={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          shareData={{
            url: `${SITE_URL}/dashboard/today`,
            userName: displayName,
            element: primaryElement || undefined,
            luckyColor: dailyReading?.luckyColor || undefined,
            luckyNumber: dailyReading?.luckyNumber || undefined,
          }}
        />
      </div>
    </div>
  );
}
