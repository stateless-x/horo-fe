'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, Heart, Sparkles } from 'lucide-react';
import Image from 'next/image';
import type { RelationshipType } from '@/lib-packages/shared';
import type { CompatibilityV4Content } from '@/lib-packages/shared/types/compatibility';
import { REPORT_CARD, SectionHeading, ThaiText } from './report-kit';
import { planFrameFor } from './report-copy';
import { relationshipReportVisuals } from './report-visuals';

const storageKey = (reportId: string) => `saimu.compat.moments.${reportId}`;

function readTried(reportId: string): number[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey(reportId));
  } catch {
    return [];
  }
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return Array.isArray(parsed) ? parsed.filter((day): day is number => typeof day === 'number') : [];
}

interface PlanChecklistProps {
  plan: CompatibilityV4Content['plan'];
  relationshipType?: RelationshipType;
  score: number;
  /** The choices saved in this browser belong to this one compatibility report. */
  reportId?: string;
}

/**
 * A low-pressure relationship practice picker. It reveals one useful moment at
 * a time, instead of presenting care as a dated checklist that must be finished.
 */
export function PlanChecklist({ plan, relationshipType, score, reportId }: PlanChecklistProps) {
  const [tried, setTried] = useState<number[]>([]);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [unsaved, setUnsaved] = useState(false);
  const frame = planFrameFor(relationshipType, score);
  const practiceVisuals = relationshipReportVisuals(relationshipType).practices;
  const practiceArts = [practiceVisuals.space, practiceVisuals.voice, practiceVisuals.focus];
  const isRomanticContext = relationshipType === 'romantic' || relationshipType === 'talking' || !relationshipType;
  const MomentIcon = isRomanticContext ? Heart : Sparkles;

  useEffect(() => {
    if (reportId) setTried(readTried(reportId));
  }, [reportId]);

  const toggleTried = (day: number) => {
    const next = tried.includes(day) ? tried.filter((item) => item !== day) : [...tried, day];
    setTried(next);
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
        title={frame.title}
        sub={frame.sub}
      />
      <div className={`${REPORT_CARD} mt-4 overflow-hidden`}>
        <div className="border-b border-edge px-5 py-4 sm:px-7">
          <p className="font-heading text-base font-semibold leading-snug text-ink">{frame.prompt}</p>
          <p className="mt-1 text-sm leading-relaxed text-inkMuted">{frame.helper}</p>
        </div>
        <ol className="divide-y divide-edge">
          {plan.map((step, index) => {
            const moment = frame.moments[index] ?? {
              title: 'ค่อย ๆ อยู่ข้างกัน',
              detail: 'เลือกวิธีที่รู้สึกว่าไหวสำหรับวันนี้',
            };
            const isOpen = openDay === step.day;
            const hasTried = tried.includes(step.day);
            const detailId = `relationship-moment-${step.day}`;
            const art = practiceArts[index];
            const artSize = index === 0 ? 'h-14 w-16' : 'size-14';

            return (
              <li key={step.day} className={isOpen ? 'bg-surface2/45' : ''}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={detailId}
                  onClick={() => setOpenDay(isOpen ? null : step.day)}
                  className="flex min-h-[100px] w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface2/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accentBright sm:px-7"
                >
                  <span className={`relative grid shrink-0 place-items-center ${artSize}`}>
                    {art ? <Image alt="" width={128} height={112} src={art} sizes="64px" className="size-full object-contain" /> : <MomentIcon className="size-4 text-inkMuted" aria-hidden="true" />}
                    {hasTried && (
                      <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-success text-onAccent ring-2 ring-surface">
                        <Check className="size-3 stroke-[3]" aria-hidden="true" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-base font-semibold leading-snug text-ink">{moment.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-inkMuted">{moment.detail}</span>
                  </span>
                  <ChevronDown className={`size-5 shrink-0 text-inkMuted transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div id={detailId} className="border-t border-edge px-5 pb-5 pt-4 sm:px-7">
                    <div className="max-w-[62ch]">
                      <p className="font-heading text-sm font-semibold text-inkMuted">แม่หมอชวนมองแบบนี้</p>
                      <p className="mt-1 text-sm leading-relaxed text-inkMuted">หยิบไปใช้เท่าที่ไหว แล้วปรับให้เป็นแบบที่คุณพูดจริงได้</p>
                      <p className="mt-1.5 text-base leading-[1.7] text-ink">
                        <ThaiText>{step.action}</ThaiText>
                      </p>
                    </div>
                    <div className="mt-4 max-w-[62ch] border-t border-edge pt-4">
                      <p className="font-heading text-sm font-semibold text-inkMuted">ถ้าคำพูดช่วยให้เริ่มง่ายขึ้น</p>
                      <p className="mt-1.5 font-oracle text-lg font-light leading-[1.65] text-ink">“<ThaiText>{step.conversationStarter}</ThaiText>”</p>
                    </div>
                    <div className="mt-4 max-w-[62ch] border-t border-edge pt-4">
                      <p className="font-heading text-sm font-semibold text-inkMuted">แล้วค่อยดูว่าอะไรเกิดขึ้น</p>
                      <p className="mt-1.5 text-base leading-[1.7] text-ink">
                        <ThaiText>{step.watchFor}</ThaiText>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTried(step.day)}
                      className={`mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 font-heading text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${hasTried ? 'border-success/30 bg-success/10 text-success hover:bg-success/15' : 'border-edge bg-surface text-ink hover:bg-surface2'}`}
                    >
                      {hasTried ? <Check className="size-4 stroke-[3]" aria-hidden="true" /> : <MomentIcon className="size-4" aria-hidden="true" />}
                      {hasTried ? 'เก็บไอเดียนี้ไว้แล้ว' : 'เก็บไอเดียนี้ไว้'}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {unsaved && <p className="border-t border-edge px-5 py-3 text-sm text-warn sm:px-7">เบราว์เซอร์นี้จะจำโมเมนต์ที่ลองแล้วไม่ได้เมื่อปิดหน้า</p>}
      </div>
    </section>
  );
}
