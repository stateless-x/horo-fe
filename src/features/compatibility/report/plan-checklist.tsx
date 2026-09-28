'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { CompatibilityV4Content } from '@/lib-packages/shared/types/compatibility';
import { CopyLine } from './copy-button';
import { planDate, REPORT_CARD, SectionHeading, ThaiText } from './report-kit';

const storageKey = (reportId: string) => `saimu.compat.plan.${reportId}`;
const PLAN_FRAMES = ['เริ่มจากเรื่องเล็ก', 'คุยให้ชัดขึ้น', 'ดูว่าจังหวะเปลี่ยนไหม'] as const;

function readDone(reportId: string): number[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey(reportId));
  } catch {
    return []; // storage blocked (private mode, in-app browser): the checklist still works for this visit
  }
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return []; // a corrupt value in this browser's own storage: start the ticks again rather than break the report
  }
  return Array.isArray(parsed) ? parsed.filter((day): day is number => typeof day === 'number') : [];
}

/** The plan step's date as YYYY-MM-DD, and today's in Bangkok, to mark "วันนี้". */
function stepIso(generatedOn: string, day: number): string {
  const [year, month, date] = generatedOn.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, date + day - 1)).toISOString().slice(0, 10);
}
const bangkokToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

interface PlanChecklistProps {
  plan: CompatibilityV4Content['plan'];
  generatedOn: string;
  /** Ticks persist per reading. Without an id (dev tools) they last for the visit only. */
  reportId?: string;
}

/**
 * PlanChecklist: the 7-day plan as three dated steps to tick. Ticks are saved
 * in this browser per reading; if the browser won't store them, it says so.
 */
export function PlanChecklist({ plan, generatedOn, reportId }: PlanChecklistProps) {
  const [done, setDone] = useState<number[]>([]);
  const [unsaved, setUnsaved] = useState(false);
  const [today, setToday] = useState<string | null>(null);

  // Read after mount: the server render has no storage or clock, and the first client render must match it.
  useEffect(() => {
    if (reportId) setDone(readDone(reportId));
    setToday(bangkokToday());
  }, [reportId]);

  const toggle = (day: number) => {
    const next = done.includes(day) ? done.filter((d) => d !== day) : [...done, day];
    setDone(next);
    if (!reportId) return;
    try {
      localStorage.setItem(storageKey(reportId), JSON.stringify(next));
      setUnsaved(false);
    } catch {
      setUnsaved(true);
    }
  };

  return (
    <section id="report-plan-section" aria-labelledby="report-plan" className="scroll-mt-32 min-[1120px]:scroll-mt-20">
      <SectionHeading
        id="report-plan"
        title="3 ก้าวเล็ก ๆ ใน 7 วัน"
        sub="ไม่ต้องทำให้ครบทุกข้อ เลือกเริ่มจากข้อที่ไหว"
      />
      <div className={`${REPORT_CARD} mt-4 px-5 pb-2 pt-1.5 sm:px-7`}>
        <div className="flex items-center gap-3 pb-2.5 pt-3.5 text-sm text-inkMuted" role="status" aria-live="polite">
          <span>
            ลองแล้ว <b className="font-mono text-ink">{done.length}</b> จาก {plan.length} ก้าว
          </span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-edge" aria-hidden="true">
            <span
              className="block h-full origin-left bg-accentBright transition-transform duration-400 motion-reduce:transition-none"
              style={{ transform: `scaleX(${done.length / plan.length})` }}
            />
          </span>
        </div>
        {unsaved && <p className="pb-2 text-sm text-warn">เบราว์เซอร์นี้ไม่ให้บันทึก ติ๊กจะหายเมื่อปิดหน้า</p>}
        <ol>
          {plan.map((step, index) => {
            const checked = done.includes(step.day);
            const inputId = `plan-step-${step.day}`;
            const frame = PLAN_FRAMES[index] ?? 'ค่อย ๆ ไปต่อ';
            return (
              <li key={step.day} className="border-t border-edge pb-4 pt-3.5">
                <input id={inputId} type="checkbox" checked={checked} onChange={() => toggle(step.day)} className="peer sr-only" />
                <label htmlFor={inputId} className="grid min-h-11 cursor-pointer grid-cols-[28px_minmax(0,1fr)] items-start gap-3 peer-focus-visible:[&>span:first-child]:outline-2 peer-focus-visible:[&>span:first-child]:outline-accentBright peer-focus-visible:[&>span:first-child]:outline-offset-2">
                  <span
                    className={`mt-0.5 grid size-[26px] place-items-center rounded-lg border-2 transition-colors ${checked ? 'border-accent bg-accent' : 'border-accentBright/55 bg-surface'}`}
                  >
                    <Check className={`size-4 stroke-[3] text-accentInk transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[0.8125rem] leading-normal text-inkMuted">
                      <span>ก้าวที่ {index + 1} · {frame}</span>
                      <span>ภายในวันที่ <span className="font-mono">{step.day}</span> · {planDate(generatedOn, step.day)}</span>
                      {today === stepIso(generatedOn, step.day) && (
                        <span className="rounded-full bg-romance/15 px-2 font-heading font-semibold text-romanceText">วันนี้</span>
                      )}
                      {checked && <span className="rounded-full bg-success/10 px-2 font-heading font-semibold text-success">ลองแล้ว</span>}
                    </span>
                    <span className={`mt-0.5 block font-medium leading-[1.7] ${checked ? 'text-inkMuted' : 'text-ink'}`}>
                      <ThaiText>{step.action}</ThaiText>
                    </span>
                  </span>
                </label>
                <div className="ml-10 mt-2.5 grid gap-3">
                  <div>
                    <h3 className="mb-1.5 font-heading text-sm font-semibold leading-snug text-inkMuted">ถ้าพร้อมคุย ลองใช้ประโยคนี้</h3>
                    <CopyLine id={`plan-starter-${step.day}`} text={step.conversationStarter} />
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-heading text-sm font-semibold leading-snug text-inkMuted">แล้วค่อยดูว่าเกิดอะไรขึ้น</h3>
                    <p className="text-[0.9375rem] leading-[1.7] text-ink">
                      <ThaiText>{step.watchFor}</ThaiText>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
