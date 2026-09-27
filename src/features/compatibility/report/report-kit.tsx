import { Fragment, type ReactNode } from 'react';
import type { V4MonthLabel } from '@/lib-packages/shared/types/compatibility-v4';

/**
 * Small shared pieces of the v4 report: Thai text helpers, the seal marks
 * and the moon-phase month glyph. Type-only imports from compatibility-v4 so
 * no zod reaches the page bundle.
 */

export type ReportElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export const ELEMENT_TH: Record<ReportElement, string> = { wood: 'ไม้', fire: 'ไฟ', earth: 'ดิน', metal: 'ทอง', water: 'น้ำ' };

/** Element text color that passes contrast in both themes (the --el-* step, not the fill hue). */
export const elementText = (element: ReportElement) => ({ color: `var(--el-${element})` });

/** "เจ้าวันทองหยาง" */
export const dayMasterTh = (element: ReportElement, yinYang: 'yin' | 'yang') =>
  `เจ้าวัน${ELEMENT_TH[element]}${yinYang === 'yang' ? 'หยาง' : 'หยิน'}`;

const MBTI = /\b([IE][NS][TF][JP])\b/g;

/** Running text: MBTI codes set in the Latin accent font. */
export function ThaiText({ children }: { children: string }) {
  const parts = children.split(MBTI);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-english font-medium">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

const graphemes = new Intl.Segmenter('th', { granularity: 'grapheme' });

/**
 * The phrase-keeping rule for short display lines (archetype tagline, share
 * card): Thai has no spaces between words, so a line may only break at the
 * spaces between phrases. Phrases up to 16 graphemes never break inside.
 */
export function DisplayLine({ text }: { text: string }) {
  const phrases = text.split(' ');
  return (
    <>
      {phrases.map((phrase, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          {[...graphemes.segment(phrase)].length <= 16 ? <span className="whitespace-nowrap">{phrase}</span> : phrase}
        </Fragment>
      ))}
    </>
  );
}

/** Paragraphs from a model string that may hold blank-line breaks. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const TH_MONTH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const TH_MON = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const TH_DAY = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

/** "2026-10" -> "ตุลาคม 2569" */
export function monthName(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return `${TH_MONTH[m - 1]} ${year + 543}`;
}

/** Day N of the plan as a date, counted from the day the report was written: "อาทิตย์ 27 ก.ย." */
export function planDate(generatedOn: string, day: number): string {
  const [year, month, date] = generatedOn.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, date + day - 1));
  return `${TH_DAY[d.getUTCDay()]} ${d.getUTCDate()} ${TH_MON[d.getUTCMonth()]}`;
}

/** "2026-09-27" -> "27 ก.ย. 2569" */
export function coverDate(generatedOn: string): string {
  const [year, month, date] = generatedOn.split('-').map(Number);
  return `${date} ${TH_MON[month - 1]} ${year + 543}`;
}

export const MONTH_WORD: Record<V4MonthLabel, string> = { good: 'ดี', mixed: 'กลาง', caution: 'ระวัง' };

/** Month state color: success, accent and warn read by form too (see MoonGlyph). */
export const MONTH_TONE: Record<V4MonthLabel, string> = {
  good: 'text-success',
  mixed: 'text-inkMuted',
  caution: 'text-warn',
};

/**
 * Month states as moon phases, so the state reads by shape and not only by
 * color: full moon ดี, half moon กลาง, a thin crescent inside a broken ring ระวัง.
 */
export function MoonGlyph({ label, className = 'size-6' }: { label: V4MonthLabel; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden="true">
      {label === 'good' && <circle cx="12" cy="12" r="9" fill="currentColor" />}
      {label === 'mixed' && (
        <>
          <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 3.8a8.2 8.2 0 0 1 0 16.4z" fill="currentColor" />
        </>
      )}
      {label === 'caution' && (
        <>
          <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2.6 2.4" />
          <path d="M12 3.8a8.2 8.2 0 0 1 0 16.4a5 8.2 0 0 0 0-16.4z" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

/** The small ฉบับเต็ม seal: double ring and a four-point star. */
export function MiniSeal({ className = 'size-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`shrink-0 -rotate-[8deg] ${className}`} aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="currentColor" strokeWidth=".8" strokeDasharray="1.4 2" />
      <path d="M20 11.5c.6 4.6 2.4 7.3 7.5 8.5-5.1 1.2-6.9 3.9-7.5 8.5-.6-4.6-2.4-7.3-7.5-8.5 5.1-1.2 6.9-3.9 7.5-8.5z" fill="currentColor" />
    </svg>
  );
}

/** The seal ring around the score medallion once the full report is open. */
export function SealRing({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 112 112"
      className="pointer-events-none absolute inset-0 size-full -rotate-[8deg] text-inkMuted"
      aria-hidden="true"
    >
      <defs>
        <path id={id} d="M56,56 m-47.5,0 a47.5,47.5 0 1,1 95,0 a47.5,47.5 0 1,1 -95,0" />
      </defs>
      <circle cx="56" cy="56" r="54.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="56" cy="56" r="41.5" fill="none" stroke="currentColor" strokeWidth=".7" strokeDasharray="1.6 2.2" />
      <text className="font-heading" fontSize="8.6" fontWeight={600} fill="currentColor">
        <textPath href={`#${id}`}>ฉบับเต็ม · ดวงคู่ · สายมู · ฉบับเต็ม · ดวงคู่ · สายมู ·</textPath>
      </text>
    </svg>
  );
}

/** Section heading with its one-line subtitle, the report's repeated rhythm. */
export function SectionHeading({ id, title, sub }: { id: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <>
      <h2 id={id} tabIndex={-1} className="font-heading text-2xl font-semibold leading-snug text-ink focus:outline-none">
        {title}
      </h2>
      {sub && <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-inkMuted">{sub}</p>}
    </>
  );
}

/** The report's card surface: DESIGN.md glass card, 16px radius. */
export const REPORT_CARD = 'glass-card rounded-2xl';

/**
 * The "bound edition" frame for ฉบับเต็ม: a second hairline inset inside the
 * card, drawn with inset shadows so the layout does not move when it appears.
 */
export const BOUND_FRAME =
  'shadow-[0_8px_24px_rgba(107,33,168,0.08),inset_0_0_0_5px_var(--surface),inset_0_0_0_6px_color-mix(in_srgb,var(--accent-bright)_22%,transparent)]';
