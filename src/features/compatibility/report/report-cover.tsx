import { Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ElementClayImage } from '@/components/ui/element-clay-image';
import type { CompatibilityV4Teaser } from '@/lib-packages/shared/types/compatibility-v4';
import {
  BOUND_FRAME,
  coverDate,
  dayMasterTh,
  DisplayLine,
  ELEMENT_TH,
  elementText,
  MiniSeal,
  REPORT_CARD,
  SealRing,
  ThaiText,
} from './report-kit';

type Person = CompatibilityV4Teaser['people']['reader'];

function PersonColumn({ name, person }: { name: string; person: Person }) {
  const glow = `color-mix(in srgb, var(--el-${person.element}) 22%, transparent)`;
  return (
    <div className="relative flex min-w-0 flex-col items-center text-center">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-5 left-1/2 size-32 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 68%)` }}
      />
      <ElementClayImage
        element={person.element}
        alt={`โมเดลดินปั้นธาตุ${ELEMENT_TH[person.element]}`}
        sizes="88px"
        className="relative size-[76px] sm:size-[88px]"
      />
      <span className="relative mt-1.5 max-w-full truncate font-heading text-[1.0625rem] font-semibold leading-snug text-ink">{name}</span>
      <span className="relative text-[0.8125rem] leading-normal text-inkMuted">
        <b className="font-semibold" style={elementText(person.element)}>
          ธาตุ{ELEMENT_TH[person.element]}
        </b>
        {person.mbti && (
          <>
            {' · '}
            <span className="font-english font-medium">{person.mbti}</span>
          </>
        )}
      </span>
      <span className="relative text-xs leading-snug text-inkMuted">{dayMasterTh(person.element, person.yinYang)}</span>
    </div>
  );
}

interface ReportCoverProps {
  /** The free fields only, so the public share page can render the same cover. */
  content: Pick<CompatibilityV4Teaser, 'archetype' | 'people'> & { verdict: string; generatedOn?: string };
  score: number;
  readerName: string;
  partnerName: string;
  relationshipLabel: string;
  /** The kind of reading above the archetype, e.g. "ดวงคู่ · ความรัก". */
  eyebrow: string;
  /** Full report open: the seal ring, the bound frame and the ฉบับเต็ม flag appear. */
  full: boolean;
}

/**
 * ReportCover: the pair, the score medallion (sealed once the full report is
 * open), the archetype as the page title, its tagline and the verdict. Free.
 */
export function ReportCover({ content, score, readerName, partnerName, relationshipLabel, eyebrow, full }: ReportCoverProps) {
  const reduce = useReducedMotion();
  const { reader, partner } = content.people;
  return (
    <section
      aria-labelledby="report-archetype"
      className={`${REPORT_CARD} relative overflow-clip px-5 pb-[22px] pt-9 sm:px-8 sm:pb-[26px] sm:pt-[42px] ${full ? BOUND_FRAME : ''}`}
    >
      <div
        role="group"
        aria-label={`${readerName} ธาตุ${ELEMENT_TH[reader.element]} กับ ${partnerName} ธาตุ${ELEMENT_TH[partner.element]}`}
        className="mx-auto grid max-w-[440px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-1"
      >
        <PersonColumn name={readerName} person={reader} />
        <div
          role="img"
          aria-label={`ความเข้ากัน ${score} จาก 100`}
          className="relative -mt-[18px] grid size-28 place-items-center sm:size-[124px]"
        >
          {full && (
            <motion.div
              className="absolute inset-0"
              initial={reduce ? false : { opacity: 0, scale: 0.8, rotate: -40 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <SealRing id="report-seal-path" />
            </motion.div>
          )}
          <div className="relative z-10 flex size-[84px] flex-col items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-romance)_38%,var(--edge))] bg-surface shadow-[0_10px_26px_-10px_rgba(107,33,168,0.35)] dark:shadow-[0_12px_32px_-10px_rgba(232,93,117,0.45)] sm:size-[92px]">
            <span className="font-heading text-[2.125rem] font-bold leading-none tracking-tight text-ink tabular-nums">
              {score}
              <small className="ml-px font-mono text-[0.6875rem] font-medium tracking-normal text-inkMuted">/100</small>
            </span>
            <span className="mt-[3px] text-[0.6875rem] leading-tight text-inkMuted">ความเข้ากัน</span>
          </div>
        </div>
        <PersonColumn name={partnerName} person={partner} />
      </div>

      <p className="mt-[18px] text-center font-mono text-xs font-medium tracking-[0.05em] text-inkMuted">{eyebrow}</p>
      <h1
        id="report-archetype"
        className="mt-1 text-balance text-center font-heading text-[clamp(2rem,8.6vw,2.75rem)] font-bold leading-tight tracking-[-0.01em] text-ink"
      >
        {content.archetype.name}
      </h1>
      <p className="mx-auto mt-1 max-w-[30ch] text-balance text-center font-oracle text-[1.0625rem] leading-relaxed text-inkMuted">
        <DisplayLine text={content.archetype.tagline} />
      </p>
      <p className="mt-5 text-balance border-t border-edge pt-[18px] font-oracle text-[1.1875rem] leading-[1.7] text-ink">
        <ThaiText>{content.verdict}</ThaiText>
      </p>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-inkMuted">
        <span className="inline-flex items-center gap-1.5 font-heading font-semibold text-romanceText">
          <Heart className="size-4" aria-hidden="true" />
          {relationshipLabel}
        </span>
        {content.generatedOn && <span>{coverDate(content.generatedOn)}</span>}
        {full && (
          <span className="inline-flex items-center gap-1.5 font-heading font-semibold text-ink">
            <MiniSeal className="size-4" />
            ฉบับเต็ม
          </span>
        )}
      </div>
    </section>
  );
}
