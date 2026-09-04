'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  Star,
  Briefcase,
  Heart,
  Coins,
  Activity,
  ChevronDown,
  Share2,
  CheckCircle2,
  XCircle,
  Hash,
  Palette,
  Compass,
  Clock,
} from 'lucide-react';

import { useDailyFortune, useUserProfile } from '@/features/fortune/hooks/use-daily-fortune';
import { LoadingSkeleton } from '@/features/fortune/loading-skeleton';
import { ErrorDisplay } from '@/features/fortune/error-display';
import { ClientDate } from '@/components/client-date';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { ELEMENT_COLORS } from '@/lib-packages/shared/constants/design';
import { PawjaiAdsBanner } from '@/components/ads/pawjai-ads-banner';
import { AutoDonationModal } from '@/components/ads/donation-modal';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ElementClayImage } from '@/components/ui/element-clay-image';

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

  const elTextStyle = dailyElementKey ? { color: `var(--el-${dailyElementKey})` } : undefined;
  const elTextClass = dailyElementKey ? '' : 'text-accentBright';

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Desktop: centered container */}
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">

        {/* ===== HERO SECTION ===== */}
        <section className="text-center mb-8">
          {/* Date */}
          <ClientDate className="text-inkMuted text-base mb-3" />

          {/* Main Score - Big visual hook */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-9 h-9 md:w-11 md:h-11"
                style={{
                  fill: star <= overallScore ? colors.primary : 'transparent',
                  stroke: star <= overallScore ? colors.primary : 'var(--ink-muted)',
                  opacity: star <= overallScore ? 1 : 0.3,
                }}
                strokeWidth={1.5}
              />
            ))}
          </div>

          {/* Daily Theme */}
          {structured?.dailyTheme && (
            <h1
              className={`text-2xl md:text-3xl font-heading font-semibold mb-3 ${elTextClass}`}
              style={elTextStyle}
            >
              {structured.dailyTheme}
            </h1>
          )}

          {/* Daily element pill */}
          {dailyElementNameThai && dailyElementKey && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-edge">
              <ElementClayImage
                element={dailyElementKey}
                alt=""
                sizes="32px"
                className="h-8 w-8"
              />
              <span className="text-base text-ink/80">
                {displayName} · ธาตุประจำวัน: {dailyElementNameThai}
                <InfoTooltip text="ธาตุที่มีอิทธิพลต่อพลังงานของวันนี้ ถ้าเข้ากับธาตุประจำตัวของเจ้าจะเป็นวันที่ดี" />
              </span>
            </div>
          )}
        </section>

        {/* ===== READING SECTION ===== */}
        {structured?.overallReading && (
          <section className="mb-8">
            <div className="p-5 md:p-6 rounded-2xl bg-surface border border-edge">
              <p className="text-lg md:text-xl leading-relaxed text-ink/90 font-oracle flex gap-3">
                <span
                  className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: dailyElementKey ? colors.primary : 'var(--accent-bright)' }}
                  aria-hidden="true"
                />
                <span>{showFullReading ? structured.overallReading : readingPreview}</span>
              </p>
              {structured.overallReading.length > 150 && (
                <button
                  onClick={() => setShowFullReading(!showFullReading)}
                  className={`mt-4 text-base font-heading flex items-center gap-1 transition-colors hover:opacity-80 ${elTextClass}`}
                  style={elTextStyle}
                >
                  {showFullReading ? 'ย่อ' : 'อ่านเพิ่มเติม'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFullReading ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </section>
        )}

        {/* ===== CATEGORY SCORES - Swipe carousel (mobile), grid (desktop) ===== */}
        {structured?.categories && (
          <section className="mb-8">
            {/* Mobile: scroll-snap carousel */}
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 gap-3 md:hidden">
              {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => {
                const config = CATEGORY_CONFIG[key];
                const data = structured.categories[key];
                const Icon = config.icon;
                const isExpanded = expandedCategory === key;

                return (
                  <button
                    key={key}
                    onClick={() => setExpandedCategory(isExpanded ? null : key)}
                    className="text-left p-4 rounded-xl bg-surface/50 border border-edge transition-colors snap-center shrink-0 w-[78%] min-h-[44px]"
                    style={{ borderColor: isExpanded ? config.color : undefined }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                        <span className="font-heading text-lg text-ink">{config.label}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-5 h-5"
                            style={{
                              fill: star <= data.score ? config.color : 'transparent',
                              stroke: star <= data.score ? config.color : 'var(--ink-muted)',
                              opacity: star <= data.score ? 1 : 0.3,
                            }}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-base text-ink/80">{data.tip}</p>

                    {isExpanded && (
                      <p className="mt-3 pt-3 border-t border-edge text-base text-ink/80 font-oracle leading-relaxed">
                        {data.reading}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Desktop: 2-col grid */}
            <div className="hidden md:grid grid-cols-2 gap-3">
              {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => {
                const config = CATEGORY_CONFIG[key];
                const data = structured.categories[key];
                const Icon = config.icon;
                const isExpanded = expandedCategory === key;

                return (
                  <button
                    key={key}
                    onClick={() => setExpandedCategory(isExpanded ? null : key)}
                    className={`text-left p-4 rounded-xl bg-surface/50 border border-edge transition-colors ${
                      isExpanded ? 'col-span-2' : ''
                    }`}
                    style={{ borderColor: isExpanded ? config.color : undefined }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                        <span className="font-heading text-lg text-ink">{config.label}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-5 h-5"
                            style={{
                              fill: star <= data.score ? config.color : 'transparent',
                              stroke: star <= data.score ? config.color : 'var(--ink-muted)',
                              opacity: star <= data.score ? 1 : 0.3,
                            }}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-base text-ink/80">{data.tip}</p>

                    {isExpanded && (
                      <p className="mt-3 pt-3 border-t border-edge text-base text-ink/80 font-oracle leading-relaxed">
                        {data.reading}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== LUCKY ATTRIBUTES - Single panel, divided cells ===== */}
        <section className="mb-8">
          <h2 className="text-lg font-heading text-ink mb-4 text-center">สิ่งมงคลวันนี้</h2>
          <div className="bg-surface border border-edge rounded-2xl grid grid-cols-2 md:grid-cols-4">
            {/* Lucky Numbers */}
            <div className="p-4 text-center border-b border-r border-edge md:border-b-0">
              <p className="flex items-center justify-center gap-1.5 text-sm text-inkMuted mb-1">
                <Hash className="w-4 h-4" />
                เลขมงคล
              </p>
              <p className="text-xl font-heading text-accentBright">
                {structured?.luckyNumbers?.join(', ') || dailyReading?.luckyNumber || '-'}
              </p>
            </div>

            {/* Lucky Color */}
            <div className="p-4 text-center border-b border-edge md:border-b-0 md:border-r">
              <p className="flex items-center justify-center gap-1.5 text-sm text-inkMuted mb-1">
                <Palette className="w-4 h-4" />
                สีมงคล
              </p>
              <p className="text-xl font-heading text-accentBright">
                {structured?.luckyColor || dailyReading?.luckyColor || '-'}
              </p>
            </div>

            {/* Lucky Direction */}
            <div className="p-4 text-center border-r border-edge">
              <p className="flex items-center justify-center gap-1.5 text-sm text-inkMuted mb-1">
                <Compass className="w-4 h-4" />
                ทิศมงคล
              </p>
              <p className="text-xl font-heading text-accentBright">
                {structured?.luckyDirection || dailyReading?.luckyDirection || '-'}
              </p>
            </div>

            {/* Lucky Moment */}
            <div className="p-4 text-center">
              <p className="flex items-center justify-center gap-1.5 text-sm text-inkMuted mb-1">
                <Clock className="w-4 h-4" />
                เวลามงคล
              </p>
              <p className="text-lg font-heading text-accentBright">
                {structured?.luckyMoment || '-'}
              </p>
            </div>
          </div>
        </section>

        <PawjaiAdsBanner />

        {/* ===== DOS & DONTS - Stack on mobile, side by side on desktop ===== */}
        {structured?.dos && structured?.donts && (
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Dos */}
              <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="font-heading text-base text-success">ควรทำ</span>
                </div>
                <ul className="space-y-4">
                  {structured.dos.map((item, i) => (
                    <li key={i} className="text-sm text-ink/80 leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-success">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Donts */}
              <div className="p-4 rounded-xl bg-warn/5 border border-warn/20">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-warn" />
                  <span className="font-heading text-base text-warn">ควรเลี่ยง</span>
                </div>
                <ul className="space-y-4">
                  {structured.donts.map((item, i) => (
                    <li key={i} className="text-sm text-ink/80 leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-warn">
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
          <section className="mb-8 p-4 rounded-xl bg-danger/5 border border-danger/20">
            <h3 className="font-heading text-base text-danger mb-3">คำเตือน</h3>
            <ul className="space-y-2">
              {structured.warnings.map((item, i) => (
                <li key={i} className="text-sm text-ink/80 leading-relaxed">· {item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ===== SHARE BUTTON ===== */}
        <button
          onClick={() => setShowShareSheet(true)}
          className="w-full py-4 rounded-xl font-heading text-lg bg-accent text-accentInk flex items-center justify-center gap-2 transition-all active:scale-[0.98] border"
          style={{ borderColor: dailyElementKey ? `${colors.primary}66` : 'transparent' }}
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
