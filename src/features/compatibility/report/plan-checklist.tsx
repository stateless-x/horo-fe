'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, Heart } from 'lucide-react';
import type { CompatibilityV4Content } from '@/lib-packages/shared/types/compatibility';
import { REPORT_CARD, SectionHeading, ThaiText } from './report-kit';

const storageKey = (reportId: string) => `saimu.compat.moments.${reportId}`;

const RELATIONSHIP_MOMENTS = [
  {
    title: 'อยู่ใกล้กันแบบไม่กดดัน',
    detail: 'เริ่มจากการอยู่ข้างกัน โดยไม่ต้องรีบหาคำตอบ',
  },
  {
    title: 'บอกสิ่งที่ต้องการแบบนุ่ม ๆ',
    detail: 'ชวนให้อีกฝ่ายเข้าใจ โดยไม่ต้องตัดสินกัน',
  },
  {
    title: 'คุยเรื่องเดียวให้ชัด',
    detail: 'ไม่ต้องเคลียร์ทุกอย่างในครั้งเดียว',
  },
] as const;

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
  /** The choices saved in this browser belong to this one compatibility report. */
  reportId?: string;
}

/**
 * A low-pressure relationship practice picker. It reveals one useful moment at
 * a time, instead of presenting care as a dated checklist that must be finished.
 */
export function PlanChecklist({ plan, reportId }: PlanChecklistProps) {
  const [tried, setTried] = useState<number[]>([]);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [unsaved, setUnsaved] = useState(false);

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
        title="ชวนกันใกล้ขึ้นทีละนิด"
        sub="เลือกแค่ 1 โมเมนต์ที่อยากลองใน 7 วันนี้ก็พอ"
      />
      <div className={`${REPORT_CARD} mt-4 overflow-hidden`}>
        <div className="border-b border-edge px-5 py-4 sm:px-7">
          <p className="font-heading text-[1.0625rem] font-semibold leading-snug text-ink">วันนี้อยากให้ความสัมพันธ์ดีขึ้นแบบไหน</p>
          <p className="mt-1 text-sm leading-relaxed text-inkMuted">ไม่มีข้อไหนต้องทำให้ครบ เลือกสิ่งที่ตรงกับใจตอนนี้ได้เลย</p>
        </div>
        <ol className="divide-y divide-edge">
          {plan.map((step, index) => {
            const moment = RELATIONSHIP_MOMENTS[index] ?? {
              title: 'ค่อย ๆ อยู่ข้างกัน',
              detail: 'เลือกวิธีที่รู้สึกว่าไหวสำหรับวันนี้',
            };
            const isOpen = openDay === step.day;
            const hasTried = tried.includes(step.day);
            const detailId = `relationship-moment-${step.day}`;

            return (
              <li key={step.day} className={isOpen ? 'bg-surface2/45' : ''}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={detailId}
                  onClick={() => setOpenDay(isOpen ? null : step.day)}
                  className="flex min-h-[76px] w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface2/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accentBright sm:px-7"
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full border ${hasTried ? 'border-success/30 bg-success/10 text-success' : 'border-edge bg-surface text-inkMuted'}`}>
                    {hasTried ? <Check className="size-4 stroke-[3]" aria-hidden="true" /> : <Heart className="size-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[1.0625rem] font-semibold leading-snug text-ink">{moment.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-inkMuted">{moment.detail}</span>
                  </span>
                  <ChevronDown className={`size-5 shrink-0 text-inkMuted transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div id={detailId} className="border-t border-edge px-5 pb-5 pt-4 sm:px-7">
                    <div className="max-w-[62ch]">
                      <p className="font-heading text-sm font-semibold text-inkMuted">ลองแบบนี้</p>
                      <p className="mt-1.5 text-[0.9375rem] leading-[1.7] text-ink">
                        <ThaiText>{step.action}</ThaiText>
                      </p>
                    </div>
                    <div className="mt-4 max-w-[62ch] border-t border-edge pt-4">
                      <p className="font-heading text-sm font-semibold text-inkMuted">ถ้าอยากพูด ลองเปิดแบบนี้</p>
                      <p className="mt-1.5 font-oracle text-lg font-light leading-[1.65] text-ink">“<ThaiText>{step.conversationStarter}</ThaiText>”</p>
                    </div>
                    <div className="mt-4 max-w-[62ch] border-t border-edge pt-4">
                      <p className="font-heading text-sm font-semibold text-inkMuted">หลังจากนั้น แค่สังเกต</p>
                      <p className="mt-1.5 text-[0.9375rem] leading-[1.7] text-ink">
                        <ThaiText>{step.watchFor}</ThaiText>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTried(step.day)}
                      className={`mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 font-heading text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${hasTried ? 'border-success/30 bg-success/10 text-success hover:bg-success/15' : 'border-edge bg-surface text-ink hover:bg-surface2'}`}
                    >
                      {hasTried ? <Check className="size-4 stroke-[3]" aria-hidden="true" /> : <Heart className="size-4" aria-hidden="true" />}
                      {hasTried ? 'วันนี้ได้ลองแล้ว' : 'เก็บไว้ลองวันนี้'}
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
