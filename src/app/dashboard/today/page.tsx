'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  Star,
  Sparkles,
  Briefcase,
  Heart,
  Coins,
  Activity,
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
import { AutoDonationModal } from '@/components/ads/donation-modal';
import { InfoTooltip } from '@/components/ui/info-tooltip';

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
  // Daily element energy (changes each day)
  const dailyElement = dailyReading?.elementEnergy || null;
  const dailyElementKey = dailyElement ? (dailyElement.toLowerCase() as keyof typeof ELEMENT_COLORS) : null;
  const colors = dailyElementKey ? ELEMENT_COLORS[dailyElementKey] : ELEMENT_COLORS.earth;
  const dailyElementNameThai = dailyElementKey ? ELEMENT_NAMES_THAI[dailyElementKey] : null;
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
        <section className="text-center mb-8">
          {/* Date */}
          <ClientDate className="text-ashGray text-base mb-3" />

          {/* Main Score - Big visual hook */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-9 h-9 md:w-11 md:h-11"
                fill={star <= overallScore ? colors.primary : 'transparent'}
                stroke={star <= overallScore ? colors.primary : 'rgba(161,161,170,0.3)'}
                strokeWidth={1.5}
              />
            ))}
          </div>

          {/* Daily Theme */}
          {structured?.dailyTheme && (
            <h1
              className="text-2xl md:text-3xl font-heading font-semibold mb-3"
              style={{ color: colors.primary }}
            >
              {structured.dailyTheme}
            </h1>
          )}

          {/* Daily element pill */}
          {dailyElementNameThai && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-deepNight/50 border border-darkPurple/30">
              <Sparkles className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-base text-ghostWhite/80">
                {displayName} · ธาตุประจำวัน: {dailyElementNameThai}
                <InfoTooltip text="ธาตุที่มีอิทธิพลต่อพลังงานของวันนี้ ถ้าเข้ากับธาตุประจำตัวของเจ้าจะเป็นวันที่ดี" />
              </span>
            </div>
          )}
        </section>

        {/* ===== READING SECTION ===== */}
        {structured?.overallReading && (
          <section className="mb-8">
            <div
              className="p-5 md:p-6 rounded-2xl bg-deepNight/50 border-l-4"
              style={{ borderLeftColor: colors.primary }}
            >
              <p className="text-lg md:text-xl leading-relaxed text-ghostWhite/90 font-oracle">
                {showFullReading ? structured.overallReading : readingPreview}
              </p>
              {structured.overallReading.length > 150 && (
                <button
                  onClick={() => setShowFullReading(!showFullReading)}
                  className="mt-4 text-base font-heading flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{ color: colors.primary }}
                >
                  {showFullReading ? 'ย่อ' : 'อ่านเพิ่มเติม'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFullReading ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </section>
        )}

        {/* ===== CATEGORY SCORES - Simple 2x2 Grid ===== */}
        {structured?.categories && (
          <section className="mb-8">
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => {
                const config = CATEGORY_CONFIG[key];
                const data = structured.categories[key];
                const Icon = config.icon;
                const isExpanded = expandedCategory === key;

                return (
                  <button
                    key={key}
                    onClick={() => setExpandedCategory(isExpanded ? null : key)}
                    className={`text-left p-4 rounded-xl bg-deepNight/50 border border-darkPurple/30 transition-colors ${
                      isExpanded ? 'col-span-2' : ''
                    }`}
                    style={{ borderColor: isExpanded ? config.color : undefined }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                        <span className="font-heading text-base text-ghostWhite">{config.label}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4"
                            fill={star <= data.score ? config.color : 'transparent'}
                            stroke={star <= data.score ? config.color : 'rgba(161,161,170,0.3)'}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-ashGray line-clamp-2">{data.tip}</p>

                    {isExpanded && (
                      <p className="mt-3 pt-3 border-t border-darkPurple/30 text-base text-ghostWhite/80 font-oracle leading-relaxed">
                        {data.reading}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== LUCKY ATTRIBUTES - Grid with labels ===== */}
        <section className="mb-8">
          <h2 className="text-lg font-heading text-ghostWhite mb-4 text-center">สิ่งมงคลวันนี้</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Lucky Numbers */}
            <div className="p-4 rounded-xl bg-deepNight/50 border border-darkPurple/30 text-center">
              <p className="text-sm text-ashGray mb-1">เลขมงคล</p>
              <p className="text-xl font-heading text-amethyst">
                {structured?.luckyNumbers?.join(', ') || dailyReading?.luckyNumber || '-'}
              </p>
            </div>

            {/* Lucky Color */}
            <div className="p-4 rounded-xl bg-deepNight/50 border border-darkPurple/30 text-center">
              <p className="text-sm text-ashGray mb-1">สีมงคล</p>
              <p className="text-xl font-heading text-amethyst">
                {structured?.luckyColor || dailyReading?.luckyColor || '-'}
              </p>
            </div>

            {/* Lucky Direction */}
            <div className="p-4 rounded-xl bg-deepNight/50 border border-darkPurple/30 text-center">
              <p className="text-sm text-ashGray mb-1">ทิศมงคล</p>
              <p className="text-xl font-heading text-amethyst">
                {structured?.luckyDirection || dailyReading?.luckyDirection || '-'}
              </p>
            </div>

            {/* Lucky Moment */}
            <div className="p-4 rounded-xl bg-deepNight/50 border border-darkPurple/30 text-center">
              <p className="text-sm text-ashGray mb-1">เวลามงคล</p>
              <p className="text-lg font-heading text-amethyst">
                {structured?.luckyMoment || '-'}
              </p>
            </div>
          </div>
        </section>

        <PawjaiAdsBanner />

        {/* ===== DOS & DONTS - Side by side ===== */}
        {structured?.dos && structured?.donts && (
          <section className="mb-8">
            <div className="grid grid-cols-2 gap-3">
              {/* Dos */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-heading text-base text-emerald-400">ควรทำ</span>
                </div>
                <ul className="space-y-4">
                  {structured.dos.map((item, i) => (
                    <li key={i} className="text-sm text-ghostWhite/80 leading-relaxed pl-4 border-l-2 border-emerald-500/30">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Donts */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-amber-400" />
                  <span className="font-heading text-base text-amber-400">ควรเลี่ยง</span>
                </div>
                <ul className="space-y-4">
                  {structured.donts.map((item, i) => (
                    <li key={i} className="text-sm text-ghostWhite/80 leading-relaxed pl-4 border-l-2 border-amber-500/30">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* ===== WARNINGS (if any) ===== */}
        {structured?.warnings && structured.warnings.length > 0 && (
          <section className="mb-8 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <h3 className="font-heading text-base text-red-400 mb-3">คำเตือน</h3>
            <ul className="space-y-2">
              {structured.warnings.map((item, i) => (
                <li key={i} className="text-sm text-ghostWhite/80 leading-relaxed">· {item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ===== SHARE BUTTON ===== */}
        <button
          onClick={() => setShowShareSheet(true)}
          className="w-full py-4 rounded-xl font-heading text-lg text-ghostWhite flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ backgroundColor: colors.primary }}
        >
          <Share2 className="w-5 h-5" />
          แชร์ดวงวันนี้
        </button>

        <ShareSheet
          isOpen={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          shareData={{
            url: `${SITE_URL}/dashboard/today`,
            userName: displayName,
            element: dailyElement || undefined,
            luckyColor: structured?.luckyColor || dailyReading?.luckyColor || undefined,
            luckyNumber: dailyReading?.luckyNumber || undefined,
          }}
        />

        <AutoDonationModal />
      </div>
    </div>
  );
}
