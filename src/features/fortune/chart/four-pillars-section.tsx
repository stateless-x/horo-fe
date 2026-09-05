'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  EnrichedPillar,
  PillarInterpretation,
  PillarInteraction,
} from '@/lib-packages/shared/types/astrology';
import { ElementClayImage, type ClayElement } from '@/components/ui/element-clay-image';
import { PillarDetailModal } from './pillar-detail-modal';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { firstClauseOrTruncate } from '@/lib/text-utils';

interface FourPillarsSectionProps {
  pillars: {
    year: EnrichedPillar;
    month: EnrichedPillar;
    day: EnrichedPillar;
    hour?: EnrichedPillar;
  };
  pillarInterpretations: PillarInterpretation[];
  pillarInteractions: PillarInteraction[];
}

const PILLAR_LABELS: Record<string, string> = {
  year: 'เสาปี',
  month: 'เสาเดือน',
  day: 'เสาวัน',
  hour: 'เสาชั่วโมง',
};

type PillarKey = 'year' | 'month' | 'day' | 'hour';

export function FourPillarsSection({
  pillars,
  pillarInterpretations,
  pillarInteractions,
}: FourPillarsSectionProps) {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const openPillarModal = (pillarKey: string) => {
    setSelectedPillar(pillarKey);
  };

  const pillarArray: { key: PillarKey; pillar: EnrichedPillar }[] = [
    { key: 'year', pillar: pillars.year },
    { key: 'month', pillar: pillars.month },
    { key: 'day', pillar: pillars.day },
    ...(pillars.hour ? [{ key: 'hour' as const, pillar: pillars.hour }] : []),
  ];
  const dayIndex = pillarArray.findIndex((p) => p.key === 'day');

  // The day pillar (เสาวัน) is the self, so the carousel opens there — but only
  // once the track has real width. It mounts inside a closed <details>, which
  // renders at zero width until opened, so scrollIntoView before then is a
  // silent no-op. A ResizeObserver catches the moment the disclosure opens.
  useEffect(() => {
    const track = trackRef.current;
    const target = slideRefs.current[dayIndex];
    if (!track || !target || dayIndex < 0) return;

    let started = false;
    const tryScroll = () => {
      if (started || track.clientWidth === 0) return;
      started = true;
      // A track-local write, not scrollIntoView: scrollIntoView walks every
      // scrollable ancestor, which can jump the whole page the instant the
      // disclosure opens and this effect fires. This only ever moves the
      // carousel's own scroll position.
      track.scrollLeft = target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2;
      setActiveIndex(dayIndex);
    };

    tryScroll();
    const observer = new ResizeObserver(tryScroll);
    observer.observe(track);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active dot follows real scroll position (swipes included), not a click
  // counter: find the slide whose center is closest to the track's center.
  const updateActiveFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const trackCenter = track.scrollLeft + track.clientWidth / 2;

    let closest = 0;
    let closestDistance = Infinity;
    slideRefs.current.forEach((slide, i) => {
      if (!slide) return;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(slideCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    return () => track.removeEventListener('scroll', updateActiveFromScroll);
  }, [updateActiveFromScroll]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    const target = slideRefs.current[index];
    if (!track || !target) return;
    // Instant scroll on purpose. On this snap-mandatory track Chromium cancels
    // programmatic smooth scrolls outright (measured: scrollTo with
    // behavior 'smooth' left scrollLeft at 0 every time, while 'auto' landed
    // every time), so a smooth request meant arrow taps did nothing. Snap
    // still aligns the slide, so the jump reads as a page turn.
    // The target comes from rects relative to the track: the slides'
    // offsetParent is an ancestor, not the track, so offsetLeft only works
    // by coincidence of layout.
    const trackRect = track.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const left =
      track.scrollLeft + (targetRect.left - trackRect.left) - (track.clientWidth - targetRect.width) / 2;
    track.scrollTo({ left, behavior: 'auto' });
    setActiveIndex(index);
  };

  const goPrev = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const goNext = () => scrollToIndex(Math.min(pillarArray.length - 1, activeIndex + 1));

  const handleTrackKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
  };

  const renderCard = (pillarKey: PillarKey, pillar: EnrichedPillar, index: number) => {
    const isDay = pillarKey === 'day';
    const interpretation = pillarInterpretations.find((p) => p.pillarKey === pillarKey);
    const summary = interpretation?.summary
      ? interpretation.summary
      : interpretation?.interpretation
        ? firstClauseOrTruncate(interpretation.interpretation)
        : null;
    const firstTip = interpretation?.tips?.[0];

    return (
      <div
        key={pillarKey}
        ref={(el) => {
          slideRefs.current[index] = el;
        }}
        role="group"
        aria-roledescription="slide"
        aria-label={`${PILLAR_LABELS[pillarKey]}, ${index + 1} จาก ${pillarArray.length}`}
        className="w-[83%] shrink-0 snap-center md:w-auto md:shrink md:snap-align-none"
      >
        <button
          onClick={() => openPillarModal(pillarKey)}
          aria-haspopup="dialog"
          className={`
            flex h-full w-full flex-col items-center rounded-xl border p-5 text-center transition-all duration-200 cursor-pointer
            hover:bg-surface2/20 hover:border-accent/50 active:scale-[0.98] motion-reduce:active:scale-100
            ${
              isDay
                ? 'border-accentBright/50 bg-surface2/20 shadow-lg shadow-accentBright/10 md:-translate-y-2'
                : 'border-edge bg-surface'
            }
          `}
          style={{ minHeight: isDay ? '220px' : '200px' }}
        >
          <ElementClayImage
            element={pillar.stemElement as ClayElement}
            alt=""
            className="mb-2 h-14 w-14"
            sizes="56px"
          />

          <h3 className="font-heading font-medium text-base text-accentBright mb-1">
            {PILLAR_LABELS[pillarKey]}
          </h3>

          <p className="font-english text-xs text-inkMuted italic mb-2">
            {pillar.stemPinyin} {pillar.branchPinyin}
          </p>

          <p className="font-thai text-base text-ink mb-2">{pillar.lifeArea}</p>

          {summary && (
            <p className="font-thai text-sm text-inkMuted leading-snug mb-1">{summary}</p>
          )}
          {firstTip && (
            <p className="line-clamp-1 font-thai text-xs text-inkMuted/80 leading-snug">{firstTip}</p>
          )}

          {/* The clay image already carries the element hue, so the dot that
              used to be the only element cue is redundant now and dropped. */}
          <span className="mt-auto pt-3 flex items-center gap-0.5 font-heading text-xs text-accentBright">
            ดูรายละเอียด
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </span>
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-heading text-2xl font-medium text-ink mb-2">
          เสาชะตาทั้งสี่ของเจ้า
          <InfoTooltip text="เสาสี่ต้น (四柱) คือหัวใจของ Bazi คำนวณจากปี เดือน วัน และเวลาเกิด แต่ละเสาบอกถึงด้านต่างๆ ของชีวิต" />
        </h2>
        <p className="font-thai text-inkMuted text-sm">
          แต่ละเสาเผยถึงอิทธิพลที่หล่อหลอมชีวิตของเจ้า
        </p>
      </div>

      {/* Mobile: horizontal scroll-snap carousel. md+: four-column grid. */}
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="เสาชะตาทั้งสี่"
        tabIndex={0}
        onKeyDown={handleTrackKeyDown}
        className="flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accentBright md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:snap-none md:px-0"
      >
        {pillarArray.map(({ key, pillar }, index) => renderCard(key, pillar, index))}
      </div>

      {/* Arrows + dots: mobile only, the grid shows every card at md+. */}
      <div className="mt-4 flex items-center justify-center gap-4 md:hidden">
        <button
          type="button"
          onClick={goPrev}
          disabled={activeIndex === 0}
          aria-label="เสาก่อนหน้า"
          className="flex size-11 items-center justify-center rounded-full border-2 border-accentBright text-accentBright transition-colors hover:bg-accentBright/10 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          {pillarArray.map((p, index) => (
            <span
              key={p.key}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? 'w-4 bg-accentBright' : 'w-1.5 bg-edge'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={activeIndex === pillarArray.length - 1}
          aria-label="เสาถัดไป"
          className="flex size-11 items-center justify-center rounded-full border-2 border-accentBright text-accentBright transition-colors hover:bg-accentBright/10 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Pillar Detail Modal */}
      <PillarDetailModal
        isOpen={selectedPillar !== null}
        onClose={() => setSelectedPillar(null)}
        pillar={
          selectedPillar
            ? (pillars[selectedPillar as keyof typeof pillars] ?? null)
            : null
        }
        pillarKey={selectedPillar}
        interpretation={
          pillarInterpretations.find((p) => p.pillarKey === selectedPillar) ||
          null
        }
      />
    </div>
  );
}
