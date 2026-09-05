'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Share2,
  CheckCircle2,
  XCircle,
  Hash,
  Palette,
  Compass,
  Clock,
  Sparkles,
} from 'lucide-react';

import { useDailyFortune, useUserProfile, getDailyHookLine } from '@/features/fortune/hooks/use-daily-fortune';
import { LoadingSkeleton } from '@/features/fortune/loading-skeleton';
import { ErrorDisplay } from '@/features/fortune/error-display';
import { ClientDate } from '@/components/client-date';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { PawjaiAdsBanner } from '@/components/ads/pawjai-ads-banner';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ElementClayImage } from '@/components/ui/element-clay-image';
import { CategoryClayImage } from '@/components/ui/category-clay-image';
import { FORTUNE_CATEGORY_CONFIG, DAILY_CATEGORY_KEYS } from '@/lib/fortune-category-config';
import { localizeColorName } from '@/lib/thai-localize';

const ELEMENT_NAMES_THAI = {
  wood: 'ไม้',
  fire: 'ไฟ',
  earth: 'ดิน',
  metal: 'ทอง',
  water: 'น้ำ',
} as const;

type CategoryKey = (typeof DAILY_CATEGORY_KEYS)[number];
type ElementKey = keyof typeof ELEMENT_NAMES_THAI;

function scoreToPercent(score: number): number {
  return Math.round((Math.min(Math.max(score, 0), 5) / 5) * 100);
}

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
  const normalizedElement = dailyElement?.toLowerCase();
  const dailyElementKey = normalizedElement && normalizedElement in ELEMENT_NAMES_THAI
    ? normalizedElement as ElementKey
    : null;
  const dailyElementNameThai = dailyElementKey ? ELEMENT_NAMES_THAI[dailyElementKey] : null;
  const structured = dailyReading?.structuredContent;
  const overallScore = structured?.overallScore ?? 3;
  const overallPercent = scoreToPercent(overallScore);
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
    <div className="min-h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-10">
        <section className="relative overflow-hidden rounded-2xl border border-edge bg-surface px-5 py-6 shadow-xl shadow-accent/10 md:px-9 md:py-9">
          <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-accentBright/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-28 left-1/4 size-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />

          <div className="relative grid items-center gap-2 md:grid-cols-[1fr_13rem] md:gap-8">
            <div className="order-2 md:order-1">
              <ClientDate className="block text-sm text-inkMuted" />
              <p className="mt-3 font-heading text-lg text-ink">ดวงของ {displayName} วันนี้</p>
              <h1 className="mt-2 max-w-[18ch] text-balance font-heading text-3xl font-semibold leading-tight text-ink md:text-4xl">
                {structured?.dailyTheme || 'วันนี้มีเรื่องดีรออยู่'}
              </h1>
              <div
                className="mt-4 max-w-sm"
                role="progressbar"
                aria-label="พลังวันนี้"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={overallPercent}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm text-inkMuted">พลังวันนี้จาก 4 ด้าน</span>
                  <span className="font-heading text-xl tabular-nums text-accentBright">{overallPercent}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-edgeSoft">
                  <div className="h-full rounded-full bg-accentBright transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${overallPercent}%` }} />
                </div>
              </div>
              {hookLine && hookLine !== structured?.dailyTheme && (
                <p className="mt-3 max-w-[42ch] font-oracle text-lg leading-relaxed text-accentFaint md:text-xl">
                  {hookLine}
                </p>
              )}
            </div>

            <div className="order-1 mx-auto w-36 md:order-2 md:w-full">
              <Image
                src="/assets/clay/little-oracle-master-v1.webp"
                alt="มาสคอตนักพยากรณ์ของสายมู"
                width={1024}
                height={1024}
                priority
                sizes="(min-width: 768px) 208px, 144px"
                className="h-auto w-full animate-float-1 object-contain motion-reduce:animate-none"
              />
            </div>
          </div>
        </section>

        <section className="mt-6" aria-labelledby="lucky-moments-title">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="lucky-moments-title" className="font-heading text-xl font-semibold text-ink">จังหวะดีของวันนี้</h2>
              <p className="mt-0.5 text-sm text-inkMuted">หยิบไปใช้เมื่อเจ้าต้องตัดสินใจเล็ก ๆ</p>
            </div>
            {dailyElementNameThai && dailyElementKey && (
              <div className="flex items-center gap-2 rounded-full border border-edge bg-surface px-3 py-2">
                <ElementClayImage element={dailyElementKey} alt="" sizes="32px" className="size-8" />
                <p className="text-sm text-inkMuted">
                  ธาตุวันนี้ <span className="font-heading text-ink">{dailyElementNameThai}</span>
                  <InfoTooltip text="ธาตุที่มีอิทธิพลต่อพลังงานของวันนี้" />
                </p>
              </div>
            )}
          </div>
          <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-edge bg-surface sm:grid-cols-4">
            {[
              { label: 'เลขมงคล', value: structured?.luckyNumbers?.join(', ') || dailyReading?.luckyNumber || '-', icon: Hash },
              { label: 'สีมงคล', value: localizeColorName(structured?.luckyColor || dailyReading?.luckyColor || '-'), icon: Palette },
              { label: 'ทิศมงคล', value: structured?.luckyDirection || dailyReading?.luckyDirection || '-', icon: Compass },
              { label: 'เวลามงคล', value: structured?.luckyMoment || '-', icon: Clock },
            ].map(({ label, value, icon: Icon }, index) => (
              <div
                key={label}
                className={`px-4 py-4 ${index % 2 === 1 ? 'border-l border-edge' : ''} ${index >= 2 ? 'border-t border-edge sm:border-t-0' : ''} ${index > 0 ? 'sm:border-l' : ''}`}
              >
                <dt className="flex items-center gap-1.5 text-xs text-inkMuted">
                  <Icon className="size-3.5 text-accentBright" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="mt-1 truncate font-heading text-base text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {structured?.overallReading && (
          <section className="mx-auto mt-10 max-w-3xl" aria-labelledby="today-reading-title">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-accentBright" aria-hidden="true" />
              <h2 id="today-reading-title" className="font-heading text-xl font-semibold text-ink">คำทำนายวันนี้</h2>
            </div>
            <p className="mt-4 border-t border-edge pt-5 font-oracle text-lg leading-[1.8] text-ink md:text-xl">
              {showFullReading ? structured.overallReading : readingPreview}
            </p>
            {structured.overallReading.length > 150 && (
              <button
                type="button"
                onClick={() => setShowFullReading(!showFullReading)}
                className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 font-heading text-base text-accentBright transition-colors hover:bg-accent/10 hover:text-accentSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
              >
                {showFullReading ? 'ย่อคำทำนาย' : 'อ่านต่อ'}
                <ChevronDown className={`size-4 transition-transform ${showFullReading ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            )}
          </section>
        )}

        {structured?.categories && (
          <section className="mt-12" aria-labelledby="daily-areas-title">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 id="daily-areas-title" className="font-heading text-2xl font-semibold text-ink">วันนี้แต่ละด้านเป็นยังไงบ้าง</h2>
                <p className="mt-1 text-sm text-inkMuted">แตะหนึ่งด้านเพื่ออ่านรายละเอียด</p>
              </div>
              <p className="hidden text-sm text-inkMuted sm:block">เปอร์เซ็นต์คือระดับพลังของวัน</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-edge bg-surface shadow-lg shadow-accent/5">
              {DAILY_CATEGORY_KEYS.map((key, index) => {
                const config = FORTUNE_CATEGORY_CONFIG[key];
                const data = structured.categories[key];
                const isExpanded = expandedCategory === key;
                const panelId = `daily-category-panel-${key}`;
                const percent = scoreToPercent(data.score);
                const isLove = key === 'love';
                const accentClass = isLove ? 'bg-pink-500' : 'bg-accentBright';
                const textAccentClass = isLove ? 'text-pink-600 dark:text-pink-400' : 'text-accentBright';

                return (
                  <div key={key} className={index > 0 ? 'border-t border-edge' : ''}>
                    <button
                      type="button"
                      onClick={() => setExpandedCategory(isExpanded ? null : key)}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      className="grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-3 p-4 text-left transition-colors hover:bg-surface2/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accentBright md:grid-cols-[4.5rem_1fr_12rem_auto] md:gap-5 md:p-5"
                    >
                      <CategoryClayImage category={key} sizes="72px" className="size-14 md:size-[4.5rem]" />
                      <div className="min-w-0">
                        <p className="font-heading text-lg font-semibold text-ink">{config.label}</p>
                        <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-inkMuted md:text-base">{data.tip}</p>
                      </div>
                      <div className="hidden md:block">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-inkMuted">พลังวันนี้</span>
                          <span className={`font-heading tabular-nums ${textAccentClass}`}>{percent}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-edgeSoft" aria-hidden="true">
                          <div className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${accentClass}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-heading text-lg tabular-nums md:hidden ${textAccentClass}`}>{percent}%</span>
                        <ChevronDown className={`size-5 text-inkMuted transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </div>
                    </button>
                    <div id={panelId} hidden={!isExpanded} className="px-4 pb-5 md:px-5 md:pb-6">
                      <p className="ml-0 max-w-[64ch] border-t border-edge pt-4 font-oracle text-lg leading-[1.8] text-ink md:ml-[5.75rem]">
                        {data.reading}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(doItems.length > 0 || avoidItems.length > 0) && (
          <section className="mt-12 overflow-hidden rounded-2xl border border-edge bg-surface2/55" aria-label="สิ่งที่ควรทำและควรเลี่ยง">
            <div className="grid md:grid-cols-2">
              {doItems.length > 0 && (
                <div className="p-5 md:p-7">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
                    <h2 className="font-heading text-xl font-semibold text-ink">ลองทำแบบนี้</h2>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {visibleDoItems.map((item, i) => (
                      <li key={i} className="relative pl-5 text-sm leading-relaxed text-ink md:text-base before:absolute before:left-0 before:top-2.5 before:size-1.5 before:rounded-full before:bg-success">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {avoidItems.length > 0 && (
                <div className="border-t border-edge p-5 md:border-l md:border-t-0 md:p-7">
                  <div className="flex items-center gap-2">
                    <XCircle className="size-5 text-warn" aria-hidden="true" />
                    <h2 className="font-heading text-xl font-semibold text-ink">เก็บไว้ในใจ</h2>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {visibleAvoidItems.map((item, i) => (
                      <li key={i} className="relative pl-5 text-sm leading-relaxed text-ink md:text-base before:absolute before:left-0 before:top-2.5 before:size-1.5 before:rounded-full before:bg-warn">
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
                className="flex min-h-12 w-full items-center justify-center gap-1 border-t border-edge bg-surface/70 font-heading text-sm text-accentBright transition-colors hover:bg-accent/10 hover:text-accentSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accentBright"
              >
                ดูคำแนะนำทั้งหมด ({hiddenGuidanceCount})
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
            )}
          </section>
        )}

        <button
          type="button"
          onClick={() => setShowShareSheet(true)}
          className="mt-10 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 font-heading text-lg text-accentInk shadow-lg shadow-accent/30 transition-all hover:bg-accentBright active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
        >
          <Share2 className="size-5" aria-hidden="true" />
          แชร์ดวงวันนี้
        </button>

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

      </div>
    </div>
  );
}
