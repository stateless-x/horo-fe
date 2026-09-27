'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarDays, History, ListChecks, Loader2, Lock, Sparkles, type LucideIcon } from 'lucide-react';
import { Button } from '@/lib-packages/ui';
import { BOUND_FRAME, MiniSeal, REPORT_CARD } from './report-kit';

export interface ReportContentsEntry {
  /** Element id the entry jumps to. */
  id: string;
  title: string;
  /** Short label for the phone chip bar. */
  short: string;
  /** Chapter number; the other entries show an icon. */
  n?: number;
  icon?: 'overview' | 'calendar' | 'plan';
}

const ENTRY_ICON: Record<NonNullable<ReportContentsEntry['icon']>, LucideIcon> = {
  overview: Sparkles,
  calendar: CalendarDays,
  plan: ListChecks,
};

export function EntryMark({ entry }: { entry: ReportContentsEntry }) {
  if (entry.n) return <span className="font-mono text-xs tabular-nums">{entry.n}</span>;
  const Icon = ENTRY_ICON[entry.icon ?? 'overview'];
  return <Icon className="size-[15px]" aria-hidden="true" />;
}

interface ReportDoorProps {
  partnerName: string;
  readingMinutes: number;
  contents: ReportContentsEntry[];
  /** Full report: the contents become links and the foot offers "open every chapter". */
  full: boolean;
  onJump: (id: string) => void;
  allOpen: boolean;
  onToggleAll: () => void;
  /** Teaser only: unlocks the report; a rejection's message is shown in the door. */
  onUnlock?: () => void | Promise<void>;
}

/**
 * ReportDoor: the locked panel that becomes the report's front page. Locked,
 * it lists what is inside with the unlock button; open, the same list is the
 * table of contents, framed as the bound ฉบับเต็ม.
 */
export function ReportDoor({ partnerName, readingMinutes, contents, full, onJump, allOpen, onToggleAll, onUnlock }: ReportDoorProps) {
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlock = async () => {
    if (!onUnlock || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onUnlock();
    } catch (failure) {
      // The caller turns a failed request into a message for the reader.
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby="report-door"
      className={
        full
          ? `${REPORT_CARD} px-5 pb-5 pt-[22px] sm:px-7 sm:pb-6 sm:pt-[26px] ${BOUND_FRAME}`
          : 'rounded-2xl border border-dashed border-accentBright/45 bg-surface2 px-5 pb-5 pt-[22px] sm:px-7 sm:pb-6 sm:pt-[26px]'
      }
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-full ${full ? 'text-ink' : 'border border-edge bg-surface text-inkMuted'}`}
        >
          {full ? <MiniSeal /> : <Lock className="size-5" aria-hidden="true" />}
        </span>
        <h2 id="report-door" tabIndex={-1} className="font-heading text-2xl font-semibold leading-snug text-ink focus:outline-none">
          ฉบับเต็มของคุณกับ{partnerName}
        </h2>
      </div>
      <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-inkMuted">
        อ่านราว <b className="font-semibold text-ink">{readingMinutes} นาที</b> · 6 บท · ปฏิทิน 3 เดือน · แผน 7 วัน
      </p>

      <ol className="mt-4 border-t border-edge">
        {contents.map((entry) => {
          const row = (
            <>
              <span className="grid size-7 place-items-center rounded-full border border-edge bg-surface text-inkMuted">
                <EntryMark entry={entry} />
              </span>
              <span className="font-heading font-medium leading-snug text-ink">{entry.title}</span>
              {full ? (
                <ArrowRight className="size-4 text-inkMuted" aria-hidden="true" />
              ) : (
                <Lock className="size-4 text-inkMuted" aria-hidden="true" />
              )}
            </>
          );
          return (
            <li key={entry.id} className="border-b border-edge">
              {full ? (
                <a
                  href={`#${entry.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onJump(entry.id);
                  }}
                  className="grid min-h-[50px] grid-cols-[28px_minmax(0,1fr)_18px] items-center gap-3 rounded-lg px-1.5 transition-colors hover:bg-edgeSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
                >
                  {row}
                </a>
              ) : (
                <div className="grid min-h-[50px] grid-cols-[28px_minmax(0,1fr)_18px] items-center gap-3 px-1.5">{row}</div>
              )}
            </li>
          );
        })}
      </ol>

      <AnimatePresence initial={false} mode="wait">
        {full ? (
          <motion.div
            key="foot"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-3 pt-4"
          >
            <p className="flex flex-[1_1_220px] items-start gap-2 text-[0.8125rem] leading-relaxed text-inkMuted">
              <History className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              เก็บไว้ในประวัติดวงคู่แล้ว อ่านซ้ำได้ตลอด
            </p>
            <Button type="button" variant="soft" onClick={onToggleAll} aria-pressed={allOpen} className="h-11 gap-1.5 px-3 font-heading">
              <BookOpen className="size-4" aria-hidden="true" />
              {allOpen ? 'ย่อทุกบท' : 'เปิดอ่านทุกบท'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="cta"
            exit={reduce ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 pt-5">
              {onUnlock && (
                <Button type="button" size="lg" onClick={unlock} aria-busy={busy} disabled={busy} className="h-auto min-h-14 w-full gap-2.5 whitespace-normal px-5 py-3 font-heading">
                  {busy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Lock className="size-5" aria-hidden="true" />}
                  {busy ? 'กำลังเขียนฉบับเต็ม (ราว 20 วินาที)' : 'ใช้ 1 เครดิตปลดล็อก (มี 1 เครดิต)'}
                </Button>
              )}
              <p aria-live="polite" className="empty:hidden text-[0.8125rem] leading-relaxed text-inkMuted">
                {busy ? 'ฉบับเต็มเขียนให้คู่นี้โดยเฉพาะ เสร็จแล้วจะเปิดตรงนี้เลย ไม่ต้องกดซ้ำ' : ''}
              </p>
              {error && (
                <p role="alert" className="text-[0.8125rem] leading-relaxed text-danger">
                  {error}
                </p>
              )}
              <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-inkMuted">
                <History className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                เครดิตต้อนรับ ใช้ได้กับ 1 คน · ปลดล็อกแล้วอ่านซ้ำได้ตลอดในประวัติ
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
