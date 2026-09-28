import type { ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, CircleCheck, CirclePause, CornerDownRight, Pause } from 'lucide-react';
import type { CompatibilityV4Content, V4Chapter, V4MonthLabel } from '@/lib-packages/shared/types/compatibility';
import { spaceLatinName } from '@/lib-packages/shared/types/names';
import { CopyLine } from './copy-button';
import { ELEMENT_TH, MONTH_TONE, monthName, MoonGlyph, ThaiText } from './report-kit';

/** Each kit block sits under a hairline with its own small heading. */
function Kit({ title, sub, children }: { title?: string; sub?: string; children: ReactNode }) {
  return (
    <div className="mt-[22px] border-t border-edge pt-[18px] font-thai">
      {title && <h3 className="mb-1 font-heading text-[1.0625rem] font-semibold leading-snug text-ink">{title}</h3>}
      {sub && <p className="mb-2 text-sm text-inkMuted">{sub}</p>}
      {children}
    </div>
  );
}

type Palace = CompatibilityV4Content['palace']['reader'];

/** BasisFacts: the computed basis of the attraction chapter, both spouse palaces. */
export function BasisFacts({ reader, partner, partnerName }: { reader: Palace; partner: Palace; partnerName: string }) {
  const rows: Array<[string, Palace]> = [
    ['วังคู่ครองของคุณ', reader],
    [spaceLatinName(`วังคู่ครองของ${partnerName}`, partnerName), partner],
  ];
  return (
    <Kit title="ที่มาจากดวง" sub="นักษัตรวันเกิดในปาจื้อ คือตำแหน่งวังคู่ครองของแต่ละคน">
      <dl className="mt-2.5">
        {rows.map(([label, palace]) => (
          <div key={label} className="grid gap-0 border-t border-edge py-2.5 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:gap-3">
            <dt className="text-sm text-inkMuted">{label}</dt>
            <dd className="text-[0.9375rem] font-medium text-ink">
              <b className="font-semibold">
                {palace.naksat} ({palace.animal})
              </b>{' '}
              · มี{ELEMENT_TH[palace.hidden.element]}
              {palace.hidden.yinYang === 'yang' ? 'หยาง' : 'หยิน'}ซ่อนอยู่
            </dd>
          </div>
        ))}
      </dl>
    </Kit>
  );
}

/** Small paired moves, written as something to try and something that can wait. */
export function DoAvoid({ pairs }: { pairs: NonNullable<V4Chapter['pairs']> }) {
  return (
    <Kit title="เริ่มแบบไหน เรื่องไหนพักก่อน" sub="เลือกข้อที่ตรงกับจังหวะของคุณตอนนี้แค่ข้อเดียวก็พอ">
      <div className="mb-2 hidden grid-cols-2 gap-6 border-b border-edge pb-2 sm:grid">
        <p className="font-heading text-sm font-semibold text-success">ลองทำแบบนี้</p>
        <p className="font-heading text-sm font-semibold text-warn">เรื่องนี้พักไว้ก่อน</p>
      </div>
      <ol className="divide-y divide-edge border-y border-edge">
        {pairs.map((pair, i) => (
          <li key={i} className="grid gap-3 py-4 first:pt-3 last:pb-3 sm:grid-cols-2 sm:gap-6">
            <div className="grid grid-cols-[20px_minmax(0,1fr)] gap-2.5 text-[0.9375rem] leading-[1.7] text-ink">
              <ArrowUpRight className="mt-[3px] size-4 text-success" aria-hidden="true" />
              <p><span className="mb-0.5 block font-heading text-xs font-semibold text-success sm:hidden">ลองทำแบบนี้</span><ThaiText>{pair.do}</ThaiText></p>
            </div>
            <div className="grid grid-cols-[20px_minmax(0,1fr)] gap-2.5 text-[0.9375rem] leading-[1.7] text-inkMuted">
              <Pause className="mt-[3px] size-4 text-warn" aria-hidden="true" />
              <p><span className="mb-0.5 block font-heading text-xs font-semibold text-warn sm:hidden">เรื่องนี้พักไว้ก่อน</span><ThaiText>{pair.avoid}</ThaiText></p>
            </div>
          </li>
        ))}
      </ol>
    </Kit>
  );
}

/** Ready-to-send lines as copyable chat bubbles. */
export function ReadyLines({ lines, idPrefix }: { lines: string[]; idPrefix: string }) {
  return (
    <Kit title="ประโยคพร้อมส่ง" sub="คัดลอกไปวางในแชตได้เลย ปรับคำให้เป็นเสียงของคุณได้ตามสบาย">
      <ol className="divide-y divide-edge">
        {lines.map((line, i) => (
          <li key={i} className="py-3 first:pt-0">
            <CopyLine id={`${idPrefix}-line-${i}`} text={line} />
          </li>
        ))}
      </ol>
    </Kit>
  );
}

/** Scenarios: "ถ้า…" with the repair under each. */
export function Scenarios({ scenarios }: { scenarios: NonNullable<V4Chapter['scenarios']> }) {
  return (
    <Kit title="ถ้าเกิดเรื่องนี้">
      <ol className="divide-y divide-edge">
        {scenarios.map((item, i) => (
          <li key={i} className="py-3 first:pt-0">
            <p className="font-medium leading-[1.65] text-ink">
              <ThaiText>{item.scenario}</ThaiText>
            </p>
            <div className="mt-2 grid grid-cols-[22px_minmax(0,1fr)] gap-2.5">
              <CornerDownRight className="mt-[3px] size-4 text-romanceText" aria-hidden="true" />
              <p className="font-oracle text-[1.0625rem] leading-[1.7] text-ink">
                <b className="block font-heading text-[0.8125rem] font-semibold text-romanceText">ซ่อมด้วย</b>
                <ThaiText>{item.repair}</ThaiText>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Kit>
  );
}

/** Signals: what says go on, what says slow down. */
export function Signals({ go, slow }: { go: string[]; slow: string[] }) {
  const list = (items: string[]) => (
    <ul className="mt-1.5">
      {items.map((item, i) => (
        <li key={i} className="relative border-t border-edge py-2 pl-[18px] text-[0.9375rem] leading-[1.65] text-ink">
          <span className="absolute left-0.5 top-[1.05em] size-1.5 rounded-full bg-current opacity-45" aria-hidden="true" />
          <ThaiText>{item}</ThaiText>
        </li>
      ))}
    </ul>
  );
  return (
    <Kit>
      <div className="grid gap-[18px] sm:grid-cols-2 sm:gap-6">
        <div>
          <h3 className="flex items-center gap-2 font-heading text-[1.0625rem] font-semibold text-ink">
            <CircleCheck className="size-5 text-success" aria-hidden="true" />
            สัญญาณว่าไปต่อได้
          </h3>
          {list(go)}
        </div>
        <div>
          <h3 className="flex items-center gap-2 font-heading text-[1.0625rem] font-semibold text-ink">
            <CirclePause className="size-5 text-warn" aria-hidden="true" />
            สัญญาณว่าควรชะลอ
          </h3>
          {list(slow)}
        </div>
      </div>
    </Kit>
  );
}

/** NextMonth: the computed month for the next step, pointing to the calendar. */
export function NextMonth({
  nextStep,
  label,
  onJumpToCalendar,
}: {
  nextStep: NonNullable<V4Chapter['nextStep']>;
  label: V4MonthLabel;
  onJumpToCalendar: () => void;
}) {
  return (
    <Kit>
      <div className="mt-1.5 grid grid-cols-[28px_minmax(0,1fr)] gap-3">
        <MoonGlyph label={label} className={`size-6 ${MONTH_TONE[label]}`} />
        <div>
          <h4 className="font-heading text-[1.0625rem] font-semibold leading-snug text-ink">ก้าวต่อไปเหมาะกับเดือน{monthName(nextStep.month)}</h4>
          <p className="mt-1 text-[0.9375rem] leading-[1.7] text-ink">
            <ThaiText>{nextStep.step}</ThaiText>
          </p>
          <a
            href="#report-calendar-section"
            onClick={(event) => {
              event.preventDefault();
              onJumpToCalendar();
            }}
            className="mt-1 inline-flex min-h-11 items-center gap-1.5 font-heading text-sm font-medium text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
          >
            ดูในปฏิทิน 3 เดือน
            <ArrowDown className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </Kit>
  );
}
