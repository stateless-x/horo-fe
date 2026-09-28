'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, ChartNoAxesCombined, ChevronRight, CircleUserRound, HeartHandshake, ListChecks, MessageCircleMore, Sparkles, UserRound, Share2 } from 'lucide-react';
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
import { SectionActionMap } from './report/section-action-map';
import { BasisFacts, DoAvoid, NextMonth, ReadyLines, Scenarios, Signals } from './report/chapter-kit';
import { MonthTiles } from './report/month-tiles';
import { PlanChecklist } from './report/plan-checklist';
import { ShareCard } from './report/share-card';
import { MiniSeal, paragraphs, SectionHeading, ThaiText, type ReportElement } from './report/report-kit';
import { REPORT_SECTION_IDS, relationshipReportCopy, type ReportSectionId } from './report/report-copy';
import { relationshipReportVisuals } from './report/report-visuals';

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

type ReportSection = ReportSectionId;

const REPORT_SECTION_ID_SET = new Set<ReportSection>(REPORT_SECTION_IDS);
function isReportSection(value: string | null): value is ReportSection {
  return value !== null && REPORT_SECTION_ID_SET.has(value as ReportSection);
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
  const reportCopy = relationshipReportCopy(relationshipType);
  const reportVisuals = relationshipReportVisuals(relationshipType);
  const reportSections = REPORT_SECTION_IDS.map((id) => ({
    id,
    ...reportCopy.sections[id],
    art: reportVisuals.sections[id],
  }));
  const sectionLabelOf = (key: V4ChapterKey) => reportCopy.sections[sectionForTarget(`ch-${key}`)].label;
  const doorRef = useRef<HTMLDivElement>(null);
  const sectionNavRef = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
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
    { id: 'report-plan-section', title: reportCopy.plan.findingRhythm.title, short: 'แนวทาง', icon: 'plan' },
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

  // A shared link can open directly on a later section; keep its active pill in view.
  useEffect(() => {
    const activeTab = tabListRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    activeTab?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  }, [activeSection, reduce]);

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
    const currentIndex = reportSections.findIndex((section) => section.id === activeSection);
    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = reportSections.length - 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % reportSections.length;
    else nextIndex = (currentIndex - 1 + reportSections.length) % reportSections.length;
    const next = reportSections[nextIndex];
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

            <div className="relative mt-4">
              <div
                role="tablist"
                aria-label="ส่วนของคำตอบฉบับเต็ม"
                ref={tabListRef}
                onKeyDown={handleTabsKeyDown}
                className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain py-1 pr-12 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {reportSections.map((section) => {
                  const selected = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      id={`report-tab-${section.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`report-panel-${section.id}`}
                      aria-label={section.label}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => chooseSection(section.id, false)}
                      className={`min-h-11 shrink-0 snap-start whitespace-nowrap rounded-full border px-4 font-heading text-sm font-semibold leading-none transition-[background-color,border-color,color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright active:scale-[0.98] ${selected ? 'border-ink bg-ink text-surface shadow-[0_8px_18px_-12px_rgba(28,18,38,0.5)]' : 'border-edge bg-surface text-inkMuted hover:border-ink/20 hover:text-ink'}`}
                    >
                      {section.label}
                    </button>
                  );
                })}
              </div>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-end bg-gradient-to-l from-ground via-ground/95 to-transparent text-inkMuted sm:hidden"
              >
                <ChevronRight className="size-4" />
              </span>
            </div>
          </div>

          <motion.div
            key={activeSection}
            initial={revealed && !reduce ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          >
            {reportSections.map((section) => (
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
                    src={section.art}
                    sizes={section.id === 'conversation' ? '(min-width: 640px) 96px, 80px' : '64px'}
                    className={`${section.id === 'conversation' ? 'size-20 sm:size-24' : 'size-16'} shrink-0 object-contain`}
                  />
                </div>

                {section.id === 'overview' && (
                  <>
                    <div id="report-dimensions-section" className="mt-10 scroll-mt-32 min-[1120px]:scroll-mt-20">
                      <DimensionBars dimensions={content.dimensions} lines={full.overview.dimensionLines} />
                    </div>
                    <SectionActionMap
                      title="อยากเห็นมุมไหนของคู่นี้"
                      helper="เลือกแล้วพาไปดูต่อ"
                      onChoose={jump}
                      actions={[
                        { id: 'report-dimensions-section', tag: 'เช็กจุดแข็ง', title: 'ดู 4 มิติของคู่นี้', detail: 'เคมี การสื่อสาร ความไว้ใจ และจังหวะชีวิต', icon: ChartNoAxesCombined, tone: 'accent' },
                        { id: 'report-overview-section', tag: 'เริ่มจากภาพใหญ่', title: 'อ่านเรื่องของคู่นี้', detail: 'ดูภาพรวมว่าอะไรพาให้มาเจอกัน', icon: Sparkles, tone: 'success' },
                        { id: 'ch-attraction', ...reportCopy.overviewAction, icon: HeartHandshake, tone: 'romance' },
                      ]}
                      />
                    <section id="report-overview-section" aria-labelledby="report-overview" className="mt-8 scroll-mt-20">
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

                {section.id === 'people' && (
                  <div className="mt-7">
                    <SectionActionMap
                      title="อยากเข้าใจใครก่อน"
                      helper="เลือกแล้วดูต่อได้เลย"
                      onChoose={jump}
                      actions={[
                        { id: 'ch-partner', ...reportCopy.peopleActions.partner, icon: UserRound, tone: 'accent' },
                        { id: 'ch-you', ...reportCopy.peopleActions.reader, icon: CircleUserRound, tone: 'success' },
                      ]}
                    />
                    <div className="mt-5 space-y-4">{renderChapter('partner')}{renderChapter('you')}</div>
                  </div>
                )}

                {section.id === 'conversation' && (
                  <div className="mt-7">
                    <ConversationMomentMap relationshipType={relationshipType} onChoose={(moment) => jump(`ch-${moment}`)} />
                    <div className="mt-5 space-y-4">{renderChapter('communication')}{renderChapter('friction')}</div>
                  </div>
                )}

                {section.id === 'next' && (
                  <>
                    <div className="mt-7">
                      <SectionActionMap
                        title="ตอนนี้อยากทำอะไรต่อ"
                        helper="เลือกข้อที่ตรงกับใจตอนนี้"
                        onChoose={jump}
                        actions={[
                          { id: 'ch-future', ...reportCopy.nextActions.future, icon: HeartHandshake, ...reportVisuals.next.future },
                          { id: 'report-calendar-section', ...reportCopy.nextActions.calendar, icon: CalendarDays, tone: 'warn', art: reportVisuals.next.calendar.art },
                          { id: 'report-plan-section', ...reportCopy.nextActions.plan, icon: ListChecks, tone: 'success', art: reportVisuals.next.plan.art },
                        ]}
                      />
                    </div>
                    <div className="mt-5">{renderChapter('future')}</div>
                    <div className="mt-12">
                      <MonthTiles
                        calendar={full.calendar}
                        nextStepMonth={full.chapters.find((c) => c.nextStep)?.nextStep?.month}
                        futureTitle={full.chapters.find((c) => c.key === 'future')?.title ?? CHAPTER_TITLE_TEASER('future', partnerName)}
                        onJumpToFuture={() => jump('ch-future')}
                      />
                    </div>
                    <div className="mt-12">
                      <PlanChecklist plan={full.plan} relationshipType={relationshipType} score={score} reportId={reportId} />
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

                <ReportSectionPager sections={reportSections} current={section.id} onSelect={chooseSection} />
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
  sections,
  onSelect,
}: {
  current: ReportSection;
  sections: ReadonlyArray<{ id: ReportSection; label: string }>;
  onSelect: (section: ReportSection, scroll?: boolean) => void;
}) {
  const index = sections.findIndex((section) => section.id === current);
  const previous = index > 0 ? sections[index - 1] : null;
  const next = index < sections.length - 1 ? sections[index + 1] : null;

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
