'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, HeartHandshake, MessageCircleMore, Share2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/lib-packages/ui';
import { RELATIONSHIP_LABELS, type RelationshipType } from '@/lib-packages/shared';
// Type-only: the v4 zod schemas must not reach the page bundle through this component.
import type {
  CompatibilityV4Content,
  CompatibilityV4Shaped,
  V4Chapter,
  V4ChapterKey,
} from '@/lib-packages/shared/types/compatibility';
import { spaceLatinName } from '@/lib-packages/shared/types/names';
import { ReportCover } from './report/report-cover';
import { DimensionBars } from './report/dimension-bars';
import { LockedHints } from './report/locked-hints';
import { ReportDoor, type ReportContentsEntry } from './report/report-door';
import { ChapterCard } from './report/chapter-card';
import { ConversationMomentMap } from './report/conversation-moment-map';
import { BasisFacts, DoAvoid, NextMonth, ReadyLines, Scenarios, Signals } from './report/chapter-kit';
import { MonthTiles } from './report/month-tiles';
import { PlanChecklist } from './report/plan-checklist';
import { ShareCard } from './report/share-card';
import { MiniSeal, paragraphs, SectionHeading, ThaiText, type ReportElement } from './report/report-kit';

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

type ReportSection = 'overview' | 'people' | 'conversation' | 'next';

const REPORT_SECTIONS: ReadonlyArray<{
  id: ReportSection;
  label: string;
  title: string;
  description: string;
  art: string;
}> = [
  {
    id: 'overview',
    label: 'ทำไมถึงใช่',
    title: 'ทำไมถึงเป็นคู่นี้',
    description: 'จุดที่ดึงกันเข้ามา และจุดที่ทำให้ใช่',
    art: '/assets/clay/chart-scroll-oracle.webp',
  },
  {
    id: 'people',
    label: 'อ่านนิสัยเขา',
    title: 'นิสัยเขา นิสัยเรา',
    description: 'สิ่งที่เขามักทำแบบนั้น และทำไมคุณถึงเป็นแบบนี้',
    art: '/assets/clay/compatibility-sections/two-mirrors.webp',
  },
  {
    id: 'conversation',
    label: 'คุยให้เข้าใจกัน',
    title: 'อยากให้เข้าใจกัน เริ่มคุยยังไงดี',
    description: 'เลือกจังหวะที่ตรงกับตอนนี้ แล้วหยิบวิธีคุยไปใช้ได้เลย',
    art: '/assets/clay/relationships/talking.webp',
  },
  {
    id: 'next',
    label: 'ไปต่อยังไงดี',
    title: 'ไปต่อ หรือพอแค่นี้',
    description: 'สัญญาณที่บอกว่าควรลุยหรือควรถอย',
    art: '/assets/clay/categories/life-overview.webp',
  },
];

const REPORT_SECTION_IDS = new Set<ReportSection>(REPORT_SECTIONS.map((section) => section.id));

function isReportSection(value: string | null): value is ReportSection {
  return value !== null && REPORT_SECTION_IDS.has(value as ReportSection);
}

/** The name of the section a chapter sits in, e.g. for a hint that points to its answer. */
function sectionLabelOf(key: V4ChapterKey): string {
  const id = sectionForTarget(`ch-${key}`);
  return REPORT_SECTIONS.find((section) => section.id === id)!.label;
}

function sectionForTarget(id: string): ReportSection {
  if (id === 'ch-partner' || id === 'ch-you') return 'people';
  if (id === 'ch-communication' || id === 'ch-friction') return 'conversation';
  if (id === 'ch-future' || id === 'report-calendar-section' || id === 'report-plan-section') return 'next';
  return 'overview';
}

/**
 * The ดวงคู่ report (content v4). The teaser keeps the free cover, scores,
 * offer and personal questions. After unlock, the same cover leads into four
 * focused URL-backed sections so readers never face the entire report at once.
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
  const doorRef = useRef<HTMLDivElement>(null);
  const sectionNavRef = useRef<HTMLDivElement>(null);
  const [openChapters, setOpenChapters] = useState<Set<V4ChapterKey>>(new Set());
  const [activeSection, setActiveSection] = useState<ReportSection>('overview');

  const contents: ReportContentsEntry[] = [
    { id: 'report-overview-section', title: 'ภาพรวม', short: 'ภาพรวม', icon: 'overview' },
    ...CHAPTER_KEYS.map((key, i) => ({
      id: `ch-${key}`,
      title: full?.chapters[i].title ?? CHAPTER_TITLE_TEASER(key, partnerName),
      short: CHAPTER_SHORT[key] ?? partnerName,
    })),
    { id: 'report-calendar-section', title: 'จังหวะ 3 เดือนข้างหน้า', short: 'ปฏิทิน', icon: 'calendar' },
    { id: 'report-plan-section', title: '7 วันแรกที่ควรลอง', short: '3 ก้าว', icon: 'plan' },
  ];

  const syncSectionToUrl = useCallback(
    (section: ReportSection) => {
      if (embedded || typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      url.searchParams.set('section', section);
      window.history.pushState(window.history.state, '', url);
    },
    [embedded],
  );

  const chooseSection = useCallback(
    (section: ReportSection, scroll = true) => {
      if (section === activeSection) return;
      setActiveSection(section);
      syncSectionToUrl(section);
      if (!scroll) return;
      requestAnimationFrame(() => {
        sectionNavRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
    },
    [activeSection, reduce, syncSectionToUrl],
  );

  useEffect(() => {
    if (!full || embedded || typeof window === 'undefined') return;
    const readUrl = () => {
      const value = new URL(window.location.href).searchParams.get('section');
      setActiveSection(isReportSection(value) ? value : 'overview');
    };
    readUrl();
    window.addEventListener('popstate', readUrl);
    return () => window.removeEventListener('popstate', readUrl);
  }, [full, embedded]);

  const jump = useCallback(
    (id: string) => {
      const key = id.startsWith('ch-') ? (id.slice(3) as V4ChapterKey) : null;
      if (key) setOpenChapters((prev) => new Set(prev).add(key));
      const section = sectionForTarget(id);
      if (section !== activeSection) {
        setActiveSection(section);
        syncSectionToUrl(section);
      }
      // After the destination panel and chapter open, so the scroll lands on its final position.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = document.getElementById(id);
          if (!target) return;
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          const heading = target.querySelector<HTMLElement>('h2');
          heading?.focus({ preventScroll: true });
        });
      });
    },
    [activeSection, reduce, syncSectionToUrl],
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
    sectionNavRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    document.getElementById('report-panel-overview-heading')?.focus({ preventScroll: true });
  }, [revealed, reduce]);

  const toggleChapter = (key: V4ChapterKey) =>
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  if (!full && !embedded) {
    return (
      <div className="mx-auto w-full max-w-[1080px] min-w-0 lg:grid lg:grid-cols-[minmax(0,680px)_minmax(280px,340px)] lg:items-start lg:gap-x-8 xl:gap-x-10">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <ReportCover
            content={{ archetype: content.archetype, people: content.people, verdict: content.cover.verdict, generatedOn: content.generatedOn }}
            score={score}
            readerName={reader}
            partnerName={partnerName}
            relationshipLabel={relationshipLabel}
            full={false}
          />
          <div className="mt-12 sm:mt-16">
            <DimensionBars dimensions={content.dimensions} />
          </div>
        </div>

        <div ref={doorRef} className="mt-12 scroll-mt-20 sm:mt-16 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1 lg:mt-0">
          <ReportDoor
            partnerName={partnerName}
            readingMinutes={content.readingMinutes}
            contents={contents}
            full={false}
            unlockRef={reportId}
            onJump={jump}
            allOpen={false}
            onToggleAll={() => {}}
            onUnlock={onUnlock}
          />
        </div>

        <div className="mt-12 min-w-0 sm:mt-16 lg:col-start-1 lg:row-start-2">
          <LockedHints hints={content.cover.lockedHints} partnerName={partnerName} sectionLabel={sectionLabelOf} />
          {(onShare || onNewCheck) && (
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
          )}
        </div>
      </div>
    );
  }

  const renderChapter = (key: V4ChapterKey) => {
    if (!full) return null;
    const chapter = full.chapters.find((item) => item.key === key);
    if (!chapter) return null;
    return (
      <ChapterCard
        key={chapter.key}
        chapter={chapter}
        tone={chapterTone(chapter.key, full)}
        open={openChapters.has(chapter.key)}
        onToggle={() => toggleChapter(chapter.key)}
        kit={chapterKit(chapter, full, partnerName, jump)}
        cue={chapterCue(chapter.key)}
      />
    );
  };

  const handleTabsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const currentIndex = REPORT_SECTIONS.findIndex((section) => section.id === activeSection);
    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = REPORT_SECTIONS.length - 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % REPORT_SECTIONS.length;
    else nextIndex = (currentIndex - 1 + REPORT_SECTIONS.length) % REPORT_SECTIONS.length;
    const next = REPORT_SECTIONS[nextIndex];
    chooseSection(next.id, false);
    document.getElementById(`report-tab-${next.id}`)?.focus();
  };

  const column = (
    <div className="mx-auto w-full min-w-0 max-w-[720px]">
      <ReportCover
        content={{ archetype: content.archetype, people: content.people, verdict: content.cover.verdict, generatedOn: content.generatedOn }}
        score={score} readerName={reader} partnerName={partnerName} relationshipLabel={relationshipLabel} full={!!full} />

      {full ? (
        <>
          <div ref={sectionNavRef} className="mt-12 scroll-mt-20 sm:mt-16">
            <div className="flex items-center gap-3 border-y border-edge py-4">
              <MiniSeal className="size-10 shrink-0 text-ink" />
              <div className="min-w-0">
                <h2 className="font-heading text-xl font-semibold leading-snug text-ink">{spaceLatinName(`ฉบับเต็มของคุณกับ${partnerName}`, partnerName)}</h2>
                <p className="mt-0.5 text-sm leading-relaxed text-inkMuted">
                  อ่านราว {full.readingMinutes} นาที · แบ่งเป็น 4 ส่วน เลือกทีละเรื่องได้เลย
                </p>
              </div>
            </div>

            <div
              role="tablist"
              aria-label="ส่วนของคำตอบฉบับเต็ม"
              onKeyDown={handleTabsKeyDown}
              className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-surface2 p-1.5 sm:grid-cols-4"
            >
              {REPORT_SECTIONS.map((section) => {
                const selected = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    id={`report-tab-${section.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`report-panel-${section.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => chooseSection(section.id, false)}
                    className={`min-h-11 whitespace-nowrap rounded-xl px-2 font-heading text-sm font-semibold leading-none transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${selected ? 'bg-surface text-ink shadow-[0_4px_14px_-8px_rgba(23,12,38,0.45)]' : 'text-inkMuted hover:bg-edgeSoft hover:text-ink'}`}
                  >
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.div
            key={activeSection}
            initial={revealed && !reduce ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          >
            {REPORT_SECTIONS.map((section) => (
              <section
                key={section.id}
                id={`report-panel-${section.id}`}
                role="tabpanel"
                aria-labelledby={`report-tab-${section.id}`}
                hidden={activeSection !== section.id}
                className="pt-10 sm:pt-12"
              >
                <div className="flex items-start gap-4 border-b border-edge pb-5">
                  <div className="min-w-0 flex-1">
                    <h2
                      id={`report-panel-${section.id}-heading`}
                      tabIndex={-1}
                      className="text-balance font-heading text-2xl font-semibold leading-snug text-ink sm:text-3xl"
                    >
                      {section.title}
                    </h2>
                    <p className="mt-1.5 leading-relaxed text-inkMuted">{section.description}</p>
                  </div>
                  <Image
                    alt=""
                    width={128}
                    height={128}
                    src={section.id === 'conversation' ? '/assets/clay/relationships/listening.webp' : section.art}
                    sizes={section.id === 'conversation' ? '(min-width: 640px) 96px, 80px' : '64px'}
                    className={`${section.id === 'conversation' ? 'size-20 sm:size-24' : 'size-16'} shrink-0 object-contain`}
                  />
                </div>

                {section.id === 'overview' && (
                  <>
                    <div className="mt-10">
                      <DimensionBars dimensions={content.dimensions} lines={full.overview.dimensionLines} />
                    </div>
                    <section id="report-overview-section" aria-labelledby="report-overview" className="mt-12 scroll-mt-20">
                      <SectionHeading id="report-overview" title="เรื่องของคู่นี้" />
                      <div className="mt-3.5">
                        {paragraphs(full.overview.story).map((paragraph, i) => (
                          <p key={i} className="mb-[1em] max-w-[62ch] font-oracle text-lg font-light leading-[1.8] text-ink first:text-xl first:leading-[1.75]">
                            <ThaiText>{paragraph}</ThaiText>
                          </p>
                        ))}
                      </div>
                    </section>
                    <div className="mt-12">{renderChapter('attraction')}</div>
                  </>
                )}

                {section.id === 'people' && <div className="mt-8 space-y-4">{renderChapter('partner')}{renderChapter('you')}</div>}

                {section.id === 'conversation' && (
                  <div className="mt-7">
                    <ConversationMomentMap onChoose={(moment) => jump(`ch-${moment}`)} />
                    <div className="mt-5 space-y-4">{renderChapter('communication')}{renderChapter('friction')}</div>
                  </div>
                )}

                {section.id === 'next' && (
                  <>
                    <div className="mt-8">{renderChapter('future')}</div>
                    <div className="mt-12">
                      <MonthTiles
                        calendar={full.calendar}
                        nextStepMonth={full.chapters.find((c) => c.nextStep)?.nextStep?.month}
                        futureTitle={full.chapters.find((c) => c.key === 'future')?.title ?? CHAPTER_TITLE_TEASER('future', partnerName)}
                        onJumpToFuture={() => jump('ch-future')}
                      />
                    </div>
                    <div className="mt-12">
                      <PlanChecklist plan={full.plan} generatedOn={full.generatedOn} reportId={reportId} />
                    </div>
                    <div className="mt-12">
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
                  </>
                )}

                <ReportSectionPager current={section.id} onSelect={chooseSection} />
              </section>
            ))}
          </motion.div>
        </>
      ) : (
        <>
          <div className="mt-14 sm:mt-[72px]">
            <DimensionBars dimensions={content.dimensions} />
          </div>
          <div ref={doorRef} className="mt-14 scroll-mt-20 sm:mt-[72px]">
            <ReportDoor
              partnerName={partnerName}
              readingMinutes={content.readingMinutes}
              contents={contents}
              full={false}
              unlockRef={reportId}
              onJump={jump}
              allOpen={false}
              onToggleAll={() => {}}
              onUnlock={onUnlock}
            />
          </div>
          <div className="mt-14 sm:mt-[72px]">
            <LockedHints hints={content.cover.lockedHints} partnerName={partnerName} sectionLabel={sectionLabelOf} />
          </div>
        </>
      )}
    </div>
  );

  return column;
}

function ReportSectionPager({
  current,
  onSelect,
}: {
  current: ReportSection;
  onSelect: (section: ReportSection, scroll?: boolean) => void;
}) {
  const index = REPORT_SECTIONS.findIndex((section) => section.id === current);
  const previous = index > 0 ? REPORT_SECTIONS[index - 1] : null;
  const next = index < REPORT_SECTIONS.length - 1 ? REPORT_SECTIONS[index + 1] : null;

  return (
    <nav aria-label="ไปส่วนก่อนหน้าหรือส่วนถัดไป" className="mt-12 grid grid-cols-2 gap-3 border-t border-edge pt-5">
      {previous ? (
        <button
          type="button"
          onClick={() => onSelect(previous.id)}
          className="flex min-h-12 min-w-0 items-center gap-2 rounded-xl border border-edge bg-surface px-3 text-left font-heading text-sm font-semibold text-ink transition-colors hover:bg-edgeSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
        >
          <ArrowLeft className="size-4 shrink-0 text-inkMuted" aria-hidden="true" />
          <span className="min-w-0 truncate">{previous.label}</span>
        </button>
      ) : <span />}
      {next ? (
        <button
          type="button"
          onClick={() => onSelect(next.id)}
          className="flex min-h-12 min-w-0 items-center justify-end gap-2 rounded-xl border border-edge bg-surface px-3 text-right font-heading text-sm font-semibold text-ink transition-colors hover:bg-edgeSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
        >
          <span className="min-w-0 truncate">{next.label}</span>
          <ArrowRight className="size-4 shrink-0 text-inkMuted" aria-hidden="true" />
        </button>
      ) : <span />}
    </nav>
  );
}

/** Chapter titles for the locked contents list (the full report carries its own). */
function CHAPTER_TITLE_TEASER(key: V4ChapterKey, partnerName: string): string {
  return {
    attraction: 'แรงดึงดูด',
    partner: spaceLatinName(`ตัวตนของ${partnerName}ในความสัมพันธ์นี้`, partnerName),
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

/** A small tag gives the two conversation tools a use-case before the reader opens either one. */
function chapterCue(key: V4ChapterKey) {
  if (key === 'communication') {
    return {
      label: 'คุยตอนยังนิ่ง',
      actionLabel: 'ลองเริ่มแบบนี้',
      detailLabel: 'ดูวิธีเริ่มคุย',
      collapseLabel: 'ย่อวิธีเริ่มคุย',
      icon: <MessageCircleMore className="size-3.5" aria-hidden="true" />,
    };
  }
  if (key === 'friction') {
    return {
      label: 'เริ่มรู้สึกตึง',
      actionLabel: 'ลองลดแรงก่อน',
      detailLabel: 'ดูวิธีกลับมาคุย',
      collapseLabel: 'ย่อวิธีกลับมาคุย',
      icon: <HeartHandshake className="size-3.5" aria-hidden="true" />,
    };
  }
  return undefined;
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
