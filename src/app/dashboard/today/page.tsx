'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  Star,
  Sparkles,
  Briefcase,
  Heart,
  Coins,
  Activity,
  Hash,
  Palette,
  Compass,
  Clock,
  ChevronDown,
  Share2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import { useDailyFortune, useUserProfile } from '@/hooks/use-daily-fortune';
import { LoadingSkeleton } from '@/components/fortune/loading-skeleton';
import { ErrorDisplay } from '@/components/fortune/error-display';
import { ClientDate } from '@/components/client-date';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { ELEMENT_COLORS } from '@/lib-packages/shared/constants/design';
import { PawjaiAdsBanner } from '@/components/ads/pawjai-ads-banner';

const ELEMENT_NAMES_THAI: Record<string, string> = {
  wood: 'ไม้',
  fire: 'ไฟ',
  earth: 'ดิน',
  metal: 'ทอง',
  water: 'น้ำ',
};

const CATEGORY_CONFIG = {
  career: { label: 'การงาน', icon: Briefcase, color: '#4A90D9' },
  love: { label: 'ความรัก', icon: Heart, color: '#E85D75' },
  finance: { label: 'การเงิน', icon: Coins, color: '#D4A843' },
  health: { label: 'สุขภาพ', icon: Activity, color: '#5BA55B' },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

/**
 * Daily Fortune Page - /dashboard/today
 *
 * Single-scroll mobile-first design with clear visual hierarchy.
 * Desktop: centered card layout with max-width.
 */
export default function TodayPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<CategoryKey | null>(null);
  const [showFullReading, setShowFullReading] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace('/login');
    }
  }, [session, sessionLoading, router]);

  const isReady = !!session;
  const {
    data: dailyReading,
    isLoading: dailyLoading,
    error: dailyError,
  } = useDailyFortune(isReady);
  const { data: userProfile } = useUserProfile(isReady);

  if (sessionLoading || !session) return <LoadingSkeleton isLoading />;
  if (dailyLoading) return <LoadingSkeleton isLoading />;
  if (dailyError) return <ErrorDisplay error="ไม่สามารถโหลดดวงชะตาวันนี้ได้" showRetry />;

  const displayName =
    userProfile?.user?.displayName ||
    (session.user as any)?.displayName ||
    session.user.name ||
    'เจ้า';
  const primaryElement = userProfile?.astrology?.primaryElement || dailyReading?.elementEnergy || null;
  const elementKey = (primaryElement?.toLowerCase() || 'earth') as keyof typeof ELEMENT_COLORS;
  const colors = ELEMENT_COLORS[elementKey] || ELEMENT_COLORS.earth;
  const elementNameThai = ELEMENT_NAMES_THAI[elementKey] || 'ดิน';
  const structured = dailyReading?.structuredContent;
  const overallScore = structured?.overallScore || 3;

  // Truncate reading for preview
  const readingPreview = structured?.overallReading
    ? structured.overallReading.length > 150
      ? structured.overallReading.slice(0, 150) + '...'
      : structured.overallReading
    : '';

  return (
    <div className="min-h-screen">
      {/* Desktop: centered container */}
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">

        {/* ===== HERO SECTION ===== */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          {/* Date */}
          <ClientDate className="text-ashGray text-sm mb-2" />

          {/* Main Score - Big visual hook */}
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.05 * star, type: 'spring', stiffness: 400 }}
              >
                <Star
                  className="w-8 h-8 md:w-10 md:h-10"
                  fill={star <= overallScore ? colors.primary : 'transparent'}
                  stroke={star <= overallScore ? colors.primary : 'rgba(161,161,170,0.3)'}
                  strokeWidth={1.5}
                />
              </motion.div>
            ))}
          </div>

          {/* Daily Theme */}
          {structured?.dailyTheme && (
            <h1
              className="text-xl md:text-2xl font-heading font-semibold mb-2"
              style={{ color: colors.primary }}
            >
              {structured.dailyTheme}
            </h1>
          )}

          {/* User identity pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-deepNight/50 border border-darkPurple/30">
            <Sparkles className="w-3.5 h-3.5" style={{ color: colors.primary }} />
            <span className="text-sm text-ghostWhite/80">
              {displayName} · ธาตุ{elementNameThai}
            </span>
          </div>
        </motion.section>

        {/* ===== READING SECTION ===== */}
        {structured?.overallReading && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div
              className="p-4 md:p-6 rounded-2xl bg-deepNight/50 border-l-4"
              style={{ borderLeftColor: colors.primary }}
            >
              <p className="text-base md:text-lg leading-relaxed text-ghostWhite/90 font-oracle">
                {showFullReading ? structured.overallReading : readingPreview}
              </p>
              {structured.overallReading.length > 150 && (
                <button
                  onClick={() => setShowFullReading(!showFullReading)}
                  className="mt-3 text-sm font-heading flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{ color: colors.primary }}
                >
                  {showFullReading ? 'ย่อ' : 'อ่านเพิ่มเติม'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFullReading ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </motion.section>
        )}

        {/* ===== CATEGORY SCORES - Simple 2x2 Grid ===== */}
        {structured?.categories && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => {
                const config = CATEGORY_CONFIG[key];
                const data = structured.categories[key];
                const Icon = config.icon;
                const isExpanded = expandedCategory === key;

                return (
                  <motion.button
                    key={key}
                    onClick={() => setExpandedCategory(isExpanded ? null : key)}
                    className={`text-left p-4 rounded-xl bg-deepNight/50 border border-darkPurple/30 transition-all ${
                      isExpanded ? 'col-span-2 border-opacity-60' : ''
                    }`}
                    style={{ borderColor: isExpanded ? config.color : undefined }}
                    layout
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                        <span className="font-heading text-sm text-ghostWhite">{config.label}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3"
                            fill={star <= data.score ? config.color : 'transparent'}
                            stroke={star <= data.score ? config.color : 'rgba(161,161,170,0.3)'}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-ashGray line-clamp-2">{data.tip}</p>

                    {isExpanded && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-darkPurple/30 text-sm text-ghostWhite/80 font-oracle leading-relaxed"
                      >
                        {data.reading}
                      </motion.p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ===== LUCKY ATTRIBUTES - Horizontal pills ===== */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Lucky Numbers */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-deepNight/50 border border-darkPurple/30">
              <Hash className="w-4 h-4 text-amethyst" />
              <span className="text-sm text-ghostWhite">
                {structured?.luckyNumbers?.join(', ') || dailyReading?.luckyNumber || '-'}
              </span>
            </div>

            {/* Lucky Color */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-deepNight/50 border border-darkPurple/30">
              <Palette className="w-4 h-4 text-amethyst" />
              <span className="text-sm text-ghostWhite">
                {structured?.luckyColor || dailyReading?.luckyColor || '-'}
              </span>
            </div>

            {/* Lucky Direction */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-deepNight/50 border border-darkPurple/30">
              <Compass className="w-4 h-4 text-amethyst" />
              <span className="text-sm text-ghostWhite">
                {dailyReading?.luckyDirection || '-'}
              </span>
            </div>

            {/* Lucky Moment */}
            {structured?.luckyMoment && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-deepNight/50 border border-darkPurple/30">
                <Clock className="w-4 h-4 text-amethyst" />
                <span className="text-sm text-ghostWhite">{structured.luckyMoment}</span>
              </div>
            )}
          </div>
        </motion.section>

        <PawjaiAdsBanner />

        {/* ===== DOS & DONTS - Side by side ===== */}
        {structured?.dos && structured?.donts && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mb-6 mt-6"
          >
            <div className="grid grid-cols-2 gap-3">
              {/* Dos */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-heading text-sm text-emerald-400">ควรทำ</span>
                </div>
                <ul className="space-y-2">
                  {structured.dos.map((item, i) => (
                    <li key={i} className="text-xs text-ghostWhite/80 leading-relaxed">
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Donts */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-amber-400" />
                  <span className="font-heading text-sm text-amber-400">ควรเลี่ยง</span>
                </div>
                <ul className="space-y-2">
                  {structured.donts.map((item, i) => (
                    <li key={i} className="text-xs text-ghostWhite/80 leading-relaxed">
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>
        )}

        {/* ===== WARNINGS (if any) ===== */}
        {structured?.warnings && structured.warnings.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
          >
            <h3 className="font-heading text-sm text-red-400 mb-2">คำเตือน</h3>
            <ul className="space-y-1">
              {structured.warnings.map((item, i) => (
                <li key={i} className="text-xs text-ghostWhite/80">· {item}</li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* ===== SHARE BUTTON ===== */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          onClick={() => setShowShareSheet(true)}
          className="w-full py-3.5 rounded-xl font-heading text-ghostWhite flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ backgroundColor: colors.primary }}
        >
          <Share2 className="w-4 h-4" />
          แชร์ดวงวันนี้
        </motion.button>

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
