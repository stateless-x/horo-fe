'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, History, Share2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/lib-packages/ui';
import { RELATIONSHIP_LABELS, type RelationshipType } from '@/lib-packages/shared';
// Type-only: the v4 zod schemas must not reach the page bundle through this component.
import type {
  CompatibilityV4Content,
  CompatibilityV4Shaped,
  V4Chapter,
  V4ChapterKey,
} from '@/lib-packages/shared/types/compatibility-v4';
import { ReportCover } from './report/report-cover';
import { DimensionBars } from './report/dimension-bars';
import { LockedHints } from './report/locked-hints';
import { ReportDoor, type ReportContentsEntry } from './report/report-door';
import { ChapterCard } from './report/chapter-card';
import { BasisFacts, DoAvoid, NextMonth, ReadyLines, Scenarios, Signals } from './report/chapter-kit';
import { MonthTiles } from './report/month-tiles';
import { PlanChecklist } from './report/plan-checklist';
import { ShareCard } from './report/share-card';
import { ChapterChips, ChapterRail, useReportNav } from './report/chapter-nav';
import { monthName, paragraphs, SectionHeading, ThaiText, type ReportElement } from './report/report-kit';

interface CompatibilityReportProps {
  score: number;
  /** Already shaped by `shapeCompatibilityView`: the teaser view has no overview, chapters, calendar or plan. */
  content: CompatibilityV4Shaped;
  relationshipType?: RelationshipType;
  readerName: string | null;
  partnerName: string;
  /** The stored reading's id: keys the plan checklist in this browser. */
  reportId?: string;
  /** Teaser only: the unlock button on ReportDoor (the result page's unlock call, or the dev tools' view switch). */
  onUnlock?: () => void | Promise<void>;
  onShare?: () => void;
  onNewCheck?: () => void;
  /** Inside the dev tools panel: no fixed chapter nav or side rail (they belong to the page). */
  embedded?: boolean;
}

const isFull = (content: CompatibilityV4Shaped): content is CompatibilityV4Content => 'overview' in content;

const CHAPTER_SHORT: Record<V4ChapterKey, string | null> = {
  attraction: 'แรงดึงดูด',
  partner: null, // the partner's name
  you: 'คุณ',
  communication: 'สื่อสาร',
  friction: 'คืนดี',
  future: 'ไปต่อ',
};

const CHAPTER_KEYS: V4ChapterKey[] = ['attraction', 'partner', 'you', 'communication', 'friction', 'future'];

/**
 * The ดวงคู่ report (content v4), per the approved mockup. The teaser and the
 * full report are one page: the free cover, score bars and questions stay;
 * the locked panel (ReportDoor) becomes the report's front page, and the
 * overview, six chapters, calendar, plan and share card follow.
 */
export function CompatibilityReport({
  score,
  content,
  relationshipType,
  readerName,
  partnerName,
  reportId,
  onUnlock,
  onShare,
  onNewCheck,
  embedded = false,
}: CompatibilityReportProps) {
  const reduce = useReducedMotion();
  const full = isFull(content) ? content : null;
  const reader = readerName ?? 'คุณ';
  const relationshipLabel = relationshipType ? `ดวง${RELATIONSHIP_LABELS[relationshipType]}` : 'ดวงคู่';
  const eyebrow = relationshipType ? `ดวงคู่ · ${RELATIONSHIP_LABELS[relationshipType]}` : 'ดวงคู่';
  const doorRef = useRef<HTMLDivElement>(null);
  const [openChapters, setOpenChapters] = useState<Set<V4ChapterKey>>(new Set());

  const chapterNumber = useCallback((key: V4ChapterKey) => CHAPTER_KEYS.indexOf(key) + 1, []);

  const contents = useMemo<ReportContentsEntry[]>(
    () => [
      { id: 'report-overview-section', title: 'ภาพรวม', short: 'ภาพรวม', icon: 'overview' },
      ...CHAPTER_KEYS.map((key, i) => ({
        id: `ch-${key}`,
        title: full?.chapters[i].title ?? CHAPTER_TITLE_TEASER(key, partnerName),
        short: CHAPTER_SHORT[key] ?? partnerName,
        n: i + 1,
      })),
      { id: 'report-calendar-section', title: 'ปฏิทินความสัมพันธ์ 3 เดือน', short: 'ปฏิทิน', icon: 'calendar' },
      { id: 'report-plan-section', title: 'แผน 7 วัน', short: 'แผน 7 วัน', icon: 'plan' },
    ],
    [full, partnerName],
  );

  const nav = useReportNav(contents, doorRef, !!full && !embedded);

  const jump = useCallback(
    (id: string) => {
      const key = id.startsWith('ch-') ? (id.slice(3) as V4ChapterKey) : null;
      if (key) setOpenChapters((prev) => new Set(prev).add(key));
      // After the chapter opens, so the scroll lands on its final position.
      requestAnimationFrame(() => {
        const target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        const heading = target.querySelector<HTMLElement>('h2');
        heading?.focus({ preventScroll: true });
      });
    },
    [reduce],
  );

  // Unlock opens the report in place: the reveal plays from the render where
  // the content turns full (decided during render, so the first frame of the
  // opened report already animates), then the page lands on its front page.
  const [shownFull, setShownFull] = useState(!!full);
  const [revealed, setRevealed] = useState(false);
  if (!!full !== shownFull) {
    setShownFull(!!full);
    if (full) setRevealed(true);
  }
  useEffect(() => {
    if (!revealed) return;
    doorRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    document.getElementById('report-door')?.focus({ preventScroll: true });
  }, [revealed, reduce]);

  const allOpen = openChapters.size === CHAPTER_KEYS.length;
  const toggleChapter = (key: V4ChapterKey) =>
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const column = (
    <div className="mx-auto w-full min-w-0 max-w-[680px] min-[1120px]:col-start-2 min-[1120px]:mx-0">
      <ReportCover
        content={{ archetype: content.archetype, people: content.people, verdict: content.cover.verdict, generatedOn: content.generatedOn }}
        score={score} readerName={reader} partnerName={partnerName} relationshipLabel={relationshipLabel} eyebrow={eyebrow} full={!!full} />

      <div className="mt-14 sm:mt-[72px]">
        <DimensionBars dimensions={content.dimensions} lines={full?.overview.dimensionLines} />
      </div>

      <div className="mt-14 sm:mt-[72px]">
        <LockedHints hints={content.cover.lockedHints} partnerName={partnerName} chapterNumber={chapterNumber} onJump={full ? (key) => jump(`ch-${key}`) : undefined} />
      </div>

      <div ref={doorRef} className="mt-14 scroll-mt-20 sm:mt-[72px]">
        <ReportDoor
          partnerName={partnerName}
          readingMinutes={content.readingMinutes}
          contents={contents}
          full={!!full}
          onJump={jump}
          allOpen={allOpen}
          onToggleAll={() => setOpenChapters(allOpen ? new Set() : new Set(CHAPTER_KEYS))}
          onUnlock={full ? undefined : onUnlock}
        />
      </div>

      {full ? (
        <motion.div initial={revealed && !reduce ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <section id="report-overview-section" aria-labelledby="report-overview" className="mt-14 scroll-mt-32 sm:mt-[72px] min-[1120px]:scroll-mt-20">
            <SectionHeading id="report-overview" title="ภาพรวม" />
            <div className="mt-3.5">
              {paragraphs(full.overview.story).map((paragraph, i) => (
                <p key={i} className="mb-[1em] max-w-[62ch] font-oracle text-lg font-light leading-[1.8] text-ink first:text-xl first:leading-[1.75]">
                  <ThaiText>{paragraph}</ThaiText>
                </p>
              ))}
            </div>
            <a
              href="#report-dimensions-section"
              onClick={(event) => {
                event.preventDefault();
                jump('report-dimensions-section');
              }}
              className="inline-flex min-h-11 items-center gap-1.5 font-heading text-sm font-medium text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
              ความหมายของ {full.dimensions.length} มิติ อยู่ใต้แต่ละแถบด้านบน
            </a>
          </section>

          <div className="mt-14 space-y-4">
            {full.chapters.map((chapter, i) => (
              <ChapterCard
                key={chapter.key}
                chapter={chapter}
                n={i + 1}
                tone={chapterTone(chapter.key, full)}
                open={openChapters.has(chapter.key)}
                onToggle={() => toggleChapter(chapter.key)}
                kit={chapterKit(chapter, full, partnerName, jump)}
              />
            ))}
          </div>

          <div className="mt-14 sm:mt-[72px]">
            <MonthTiles
              calendar={full.calendar}
              nextStepMonth={full.chapters.find((c) => c.nextStep)?.nextStep?.month}
              futureChapterNumber={chapterNumber('future')}
              onJumpToFuture={() => jump('ch-future')}
            />
          </div>

          <div className="mt-14 sm:mt-[72px]">
            <PlanChecklist plan={full.plan} generatedOn={full.generatedOn} reportId={reportId} />
          </div>

          <section aria-labelledby="report-next" className="mt-14 sm:mt-[72px]">
            <SectionHeading id="report-next" title="ต่อจากนี้" />
            <ul className="mt-4 border-t border-edge">
              {nextLinks(full).map((link) => (
                <li key={link.id} className="border-b border-edge">
                  <a
                    href={`#${link.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      jump(link.id);
                    }}
                    className="grid min-h-14 grid-cols-[minmax(0,1fr)_20px] items-center gap-3 px-1 py-2 font-medium leading-snug text-ink transition-colors hover:bg-edgeSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
                  >
                    {link.text}
                    <ArrowRight className="size-4 text-inkMuted" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid grid-cols-[24px_minmax(0,1fr)] gap-3 rounded-xl border border-edge bg-surface2 px-4 py-3.5 text-[0.9375rem] leading-relaxed text-ink">
              <History className="mt-0.5 size-5 text-inkMuted" aria-hidden="true" />
              <p>ฉบับเต็มนี้เก็บอยู่ในประวัติดวงคู่ของคุณแล้ว เปิดอ่านซ้ำได้ตลอด</p>
            </div>
          </section>

          <div className="mt-10">
            <ShareCard
              content={content}
              score={score}
              readerName={reader}
              partnerName={partnerName}
              relationshipLabel={relationshipLabel}
              onShare={onShare}
              onNewCheck={onNewCheck}
            />
          </div>
        </motion.div>
      ) : (
        (onShare || onNewCheck) && (
          <div className="mt-6 flex flex-wrap gap-2.5">
            {onShare && (
              <Button type="button" variant="soft" onClick={onShare} className="flex-[1_1_160px] gap-2 font-heading">
                <Share2 className="size-4" aria-hidden="true" />
                แชร์การ์ดคู่นี้
              </Button>
            )}
            {onNewCheck && (
              <Button type="button" variant="ghost" onClick={onNewCheck} className="flex-[1_1_160px] font-heading">
                ดูดวงคู่กับคนอื่น
              </Button>
            )}
          </div>
        )
      )}
    </div>
  );

  if (embedded || !full) return column;
  return (
    <>
      <div className="min-[1120px]:grid min-[1120px]:grid-cols-[minmax(0,1fr)_minmax(0,680px)_minmax(0,1fr)] min-[1120px]:gap-x-12">
        <div className="hidden min-[1120px]:col-start-1 min-[1120px]:row-start-1 min-[1120px]:flex min-[1120px]:justify-end">
          <ChapterRail entries={contents} nav={nav} onJump={jump} partnerName={partnerName} readingMinutes={full.readingMinutes} />
        </div>
        <div className="min-[1120px]:col-start-2 min-[1120px]:row-start-1">{column}</div>
      </div>
      <ChapterChips entries={contents} nav={nav} onJump={jump} />
    </>
  );
}

/** Chapter titles for the locked contents list (the full report carries its own). */
function CHAPTER_TITLE_TEASER(key: V4ChapterKey, partnerName: string): string {
  return {
    attraction: 'แรงดึงดูด',
    partner: `ตัวตนของ${partnerName}ในความสัมพันธ์นี้`,
    you: 'ตัวคุณในความสัมพันธ์นี้',
    communication: 'การสื่อสาร',
    friction: 'จุดเสียดทานและวิธีคืนดี',
    future: 'สิ่งที่พาไปต่อ',
  }[key];
}

function chapterTone(key: V4ChapterKey, content: CompatibilityV4Content): ReportElement | 'romance' {
  if (key === 'partner') return content.people.partner.element;
  if (key === 'you') return content.people.reader.element;
  return 'romance';
}

function chapterKit(chapter: V4Chapter, content: CompatibilityV4Content, partnerName: string, jump: (id: string) => void) {
  switch (chapter.key) {
    case 'attraction':
      return <BasisFacts reader={content.palace.reader} partner={content.palace.partner} partnerName={partnerName} />;
    case 'communication':
      return (
        <>
          {chapter.pairs && <DoAvoid pairs={chapter.pairs} />}
          {chapter.lines && <ReadyLines lines={chapter.lines} idPrefix="ch-communication" />}
        </>
      );
    case 'friction':
      return chapter.scenarios ? <Scenarios scenarios={chapter.scenarios} /> : null;
    case 'future': {
      if (!chapter.nextStep || !chapter.goSignals || !chapter.slowSignals) return null;
      const nextStep = chapter.nextStep;
      const month = content.calendar.find((m) => m.month === nextStep.month);
      // The generation fails a report whose next-step month is not one of its calendar months.
      if (!month) throw new Error(`Next-step month ${nextStep.month} is not in the report calendar`);
      return (
        <>
          <Signals go={chapter.goSignals} slow={chapter.slowSignals} />
          <NextMonth nextStep={nextStep} label={month.label} onJumpToCalendar={() => jump('report-calendar-section')} />
        </>
      );
    }
    default:
      return null;
  }
}

function nextLinks(content: CompatibilityV4Content) {
  const nextStep = content.chapters.find((c) => c.nextStep)?.nextStep;
  return [
    { id: 'report-plan-section', text: 'เริ่มแผน 7 วัน สามก้าวเล็ก ๆ ที่ทำได้ในสัปดาห์นี้' },
    { id: 'ch-communication', text: 'เก็บประโยคพร้อมส่งไว้ใช้ ในบทการสื่อสาร' },
    ...(nextStep ? [{ id: 'ch-future', text: `กลับมาอ่านบทไปต่อ ก่อนเข้าเดือน${monthName(nextStep.month)}` }] : []),
  ];
}
