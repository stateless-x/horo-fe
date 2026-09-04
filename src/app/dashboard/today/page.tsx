'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  Star,
  ChevronDown,
  Share2,
  CheckCircle2,
  XCircle,
  Hash,
  Palette,
  Compass,
  Clock,
} from 'lucide-react';

import { useDailyFortune, useUserProfile, getDailyHookLine } from '@/features/fortune/hooks/use-daily-fortune';
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
import { CategoryClayImage } from '@/components/ui/category-clay-image';
import { FORTUNE_CATEGORY_CONFIG, DAILY_CATEGORY_KEYS } from '@/lib/fortune-category-config';
import { localizeColorName } from '@/lib/thai-localize';

const ELEMENT_NAMES_THAI: Record<string, string> = {
  wood: 'ไม้',
  fire: 'ไฟ',
  earth: 'ดิน',
  metal: 'ทอง',
  water: 'น้ำ',
};

type CategoryKey = (typeof DAILY_CATEGORY_KEYS)[number];

// Score/star styling per category: accent purple everywhere, Romance Pink on
// love only (DESIGN.md: element and category hues are payloads, not decoration).
const CATEGORY_STAR_CLASS: Record<CategoryKey, { filled: string; border: string }> = {
  career: { filled: 'fill-accentBright stroke-accentBright', border: 'border-accentBright' },
  love: { filled: 'fill-pink-500 stroke-pink-500', border: 'border-pink-500' },
  finance: { filled: 'fill-accentBright stroke-accentBright', border: 'border-accentBright' },
  health: { filled: 'fill-accentBright stroke-accentBright', border: 'border-accentBright' },
};

const EMPTY_STAR_CLASS = 'fill-transparent stroke-inkMuted opacity-35';

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
  const [showAllGuidance, setShowAllGuidance] = useState(false);

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
  const dailyElementNameThai = dailyElementKey ? ELEMENT_NAMES_THAI[dailyElementKey] : null;
  const structured = dailyReading?.structuredContent;
  const overallScore = structured?.overallScore || 3;
  const hookLine = getDailyHookLine(structured);

  // Truncate reading for preview
  const readingPreview = structured?.overallReading
    ? structured.overallReading.length > 150
      ? structured.overallReading.slice(0, 150) + '...'
      : structured.overallReading
    : '';

  // ทำ / เลี่ยง guidance: legacy warnings fold into the เลี่ยง side.
  // Two items per side stay visible; the rest sits behind one disclosure.
  const doItems = structured?.dos ?? [];
  const avoidItems = [...(structured?.donts ?? []), ...(structured?.warnings ?? [])];
  const hiddenGuidanceCount = Math.max(0, doItems.length - 2) + Math.max(0, avoidItems.length - 2);
  const visibleDoItems = showAllGuidance ? doItems : doItems.slice(0, 2);
  const visibleAvoidItems = showAllGuidance ? avoidItems : avoidItems.slice(0, 2);

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Desktop: centered container */}
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">

        {/* ===== HERO — one screenshot-ready card: date, score, theme, hook, element, lucky ===== */}
        <section className="mb-8">
          <div className="rounded-2xl bg-surface border border-edge p-5 pt-6 md:p-8 text-center">
            {/* Date */}
            <ClientDate className="text-inkMuted text-base mb-3" />

            {/* Main Score - Big visual hook */}
            <div className="flex items-center justify-center gap-1.5 mb-4" role="img" aria-label={`คะแนนวันนี้ ${overallScore} จาก 5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-9 h-9 md:w-11 md:h-11 ${star <= overallScore ? 'fill-accentBright stroke-accentBright' : EMPTY_STAR_CLASS}`}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Daily Theme */}
            {structured?.dailyTheme && (
              <h1 className="text-2xl md:text-3xl font-heading font-semibold mb-3 text-ink">
                {structured.dailyTheme}
              </h1>
            )}

            {/* Hook line — the one-sentence takeaway (v2 field; derived for legacy) */}
            {hookLine && hookLine !== structured?.dailyTheme && (
              <p className="text-lg md:text-xl font-oracle text-accentBright mb-4 max-w-[40ch] mx-auto text-balance">
                {hookLine}
              </p>
            )}

            {/* Daily element pill */}
            {dailyElementNameThai && dailyElementKey && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface2/60 border border-edge">
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

            {/* Lucky attributes — part of the shareable hero composition */}
            <dl className="mt-6 pt-5 border-t border-edge grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5">
              <div>
                <dt className="flex items-center justify-center gap-1.5 text-sm text-inkMuted mb-1">
                  <Hash className="w-4 h-4" aria-hidden="true" />
                  เลขมงคล
                </dt>
                <dd className="text-xl font-heading text-accentBright">
                  {structured?.luckyNumbers?.join(', ') || dailyReading?.luckyNumber || '-'}
                </dd>
              </div>
              <div>
                <dt className="flex items-center justify-center gap-1.5 text-sm text-inkMuted mb-1">
                  <Palette className="w-4 h-4" aria-hidden="true" />
                  สีมงคล
                </dt>
                <dd className="text-xl font-heading text-accentBright">
                  {localizeColorName(structured?.luckyColor || dailyReading?.luckyColor || '-')}
                </dd>
              </div>
              <div>
                <dt className="flex items-center justify-center gap-1.5 text-sm text-inkMuted mb-1">
                  <Compass className="w-4 h-4" aria-hidden="true" />
                  ทิศมงคล
                </dt>
                <dd className="text-xl font-heading text-accentBright">
                  {structured?.luckyDirection || dailyReading?.luckyDirection || '-'}
                </dd>
              </div>
              <div>
                <dt className="flex items-center justify-center gap-1.5 text-sm text-inkMuted mb-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  เวลามงคล
                </dt>
                <dd className="text-lg font-heading text-accentBright">
                  {structured?.luckyMoment || '-'}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ===== READING SECTION ===== */}
        {structured?.overallReading && (
          <section className="mb-8">
            <div className="p-5 md:p-6 rounded-2xl bg-surface border border-edge">
              <p className="text-lg md:text-xl leading-relaxed text-ink/90 font-oracle flex gap-3">
                <span
                  className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0 bg-accentBright"
                  aria-hidden="true"
                />
                <span>{showFullReading ? structured.overallReading : readingPreview}</span>
              </p>
              {structured.overallReading.length > 150 && (
                <button
                  onClick={() => setShowFullReading(!showFullReading)}
                  className="mt-4 min-h-11 text-base font-heading flex items-center gap-1 transition-colors text-accentBright hover:text-accentSoft"
                >
                  {showFullReading ? 'ย่อ' : 'อ่านต่อ'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFullReading ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </section>
        )}

        {/* ===== CATEGORY SCORES - one responsive list: swipe on mobile, grid on desktop ===== */}
        {structured?.categories && (
          <section className="mb-8">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 gap-3 md:grid md:grid-cols-2 md:overflow-visible md:mx-0 md:px-0">
              {DAILY_CATEGORY_KEYS.map((key) => {
                const config = FORTUNE_CATEGORY_CONFIG[key];
                const data = structured.categories[key];
                const starClass = CATEGORY_STAR_CLASS[key];
                const isExpanded = expandedCategory === key;
                const panelId = `daily-category-panel-${key}`;

                return (
                  <div
                    key={key}
                    className={`snap-center shrink-0 w-[78%] md:w-auto md:shrink rounded-xl bg-surface/50 border transition-colors ${
                      isExpanded ? `${starClass.border} md:col-span-2` : 'border-edge'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedCategory(isExpanded ? null : key)}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      className="w-full text-left p-4 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CategoryClayImage category={key} sizes="32px" className="w-8 h-8" />
                          <span className="font-heading text-lg text-ink">{config.label}</span>
                        </div>
                        <div className="flex gap-0.5" role="img" aria-label={`คะแนน ${data.score} จาก 5`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${star <= data.score ? starClass.filled : EMPTY_STAR_CLASS}`}
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-base text-ink/80">{data.tip}</p>
                    </button>

                    <div id={panelId} hidden={!isExpanded} className="px-4 pb-4">
                      <p className="pt-3 border-t border-edge text-base text-ink/80 font-oracle leading-relaxed">
                        {data.reading}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== ทำ / เลี่ยง - one card, legacy warnings folded into เลี่ยง ===== */}
        {(doItems.length > 0 || avoidItems.length > 0) && (
          <section className="mb-8">
            <div className="rounded-2xl bg-surface border border-edge p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doItems.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-success" aria-hidden="true" />
                      <h2 className="font-heading text-base text-success">ควรทำ</h2>
                    </div>
                    <ul className="space-y-3">
                      {visibleDoItems.map((item, i) => (
                        <li key={i} className="text-sm text-ink/80 leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-success">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {avoidItems.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-warn" aria-hidden="true" />
                      <h2 className="font-heading text-base text-warn">ควรเลี่ยง</h2>
                    </div>
                    <ul className="space-y-3">
                      {visibleAvoidItems.map((item, i) => (
                        <li key={i} className="text-sm text-ink/80 leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-warn">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {hiddenGuidanceCount > 0 && !showAllGuidance && (
                <button
                  type="button"
                  onClick={() => setShowAllGuidance(true)}
                  className="mt-4 min-h-11 w-full flex items-center justify-center gap-1 font-heading text-sm text-accentBright hover:text-accentSoft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright rounded"
                >
                  ดูคำแนะนำทั้งหมด ({hiddenGuidanceCount})
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </section>
        )}

        {/* ===== SHARE BUTTON ===== */}
        <button
          onClick={() => setShowShareSheet(true)}
          className="w-full py-4 rounded-xl font-heading text-lg bg-accent text-accentInk flex items-center justify-center gap-2 transition-all active:scale-[0.98] border"
          style={{ borderColor: dailyElementKey ? `var(--el-${dailyElementKey})` : 'transparent' }}
        >
          <Share2 className="w-5 h-5" />
          แชร์ดวงวันนี้
        </button>

        {/* Ad sits after the full value/action unit so it never interrupts the reading */}
        <PawjaiAdsBanner />

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

        {structured && <AutoDonationModal />}
      </div>
    </div>
  );
}
