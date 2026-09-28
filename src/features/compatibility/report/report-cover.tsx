import { Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ElementClayImage } from '@/components/ui/element-clay-image';
import type { CompatibilityV4Teaser } from '@/lib-packages/shared/types/compatibility';
import {
  BOUND_FRAME,
  coverDate,
  dayMasterTh,
  DisplayLine,
  ELEMENT_TH,
  elementText,
  MiniSeal,
  REPORT_CARD,
  ThaiText,
} from './report-kit';
import { CompatibilityTalisman, compatibilityTalismanBand } from './compatibility-talisman';

type Person = CompatibilityV4Teaser['people']['reader'];

function PersonColumn({ name, person, className = '' }: { name: string; person: Person; className?: string }) {
  const glow = `color-mix(in srgb, var(--el-${person.element}) 22%, transparent)`;
  return (
    <div className={`relative flex min-w-0 flex-col items-center text-center ${className}`}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-5 left-1/2 size-32 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 68%)` }}
      />
      <ElementClayImage
        element={person.element}
        alt={`โมเดลดินปั้นธาตุ${ELEMENT_TH[person.element]}`}
        sizes="(min-width: 640px) 88px, 56px"
        className="relative size-14 sm:size-[88px]"
      />
      <span title={name} className="relative mt-1.5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-heading text-sm font-semibold leading-snug text-ink sm:text-base">{name}</span>
      <span className="relative whitespace-nowrap text-xs leading-normal text-inkMuted sm:text-sm">
        <b className="font-semibold" style={elementText(person.element)}>
          ธาตุ{ELEMENT_TH[person.element]}
        </b>
        {person.mbti && (
          <span className="hidden sm:inline">
            {' · '}
            <span className="font-english font-medium">{person.mbti}</span>
          </span>
        )}
      </span>
      <span className="relative hidden whitespace-nowrap text-xs leading-snug text-inkMuted sm:block">{dayMasterTh(person.element, person.yinYang)}</span>
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
  /** Full report open: the bound frame and the ฉบับเต็ม flag appear. */
  full: boolean;
}

/**
 * ReportCover: the pair, their score-responsive talisman, the archetype as the
 * page title, its tagline and the verdict. The number stays accessible HTML
 * outside the artwork and never becomes an exam-like circular badge.
 */
export function ReportCover({ content, score, readerName, partnerName, relationshipLabel, full }: ReportCoverProps) {
  const reduce = useReducedMotion();
  const { reader, partner } = content.people;
  const talisman = compatibilityTalismanBand(score);
  return (
    <section
      aria-labelledby="report-archetype"
      className={`${REPORT_CARD} relative overflow-clip px-5 pb-[22px] pt-9 sm:px-8 sm:pb-[26px] sm:pt-[42px] ${full ? BOUND_FRAME : ''}`}
    >
      <div
        role="group"
        aria-label={`${readerName} ธาตุ${ELEMENT_TH[reader.element]} กับ ${partnerName} ธาตุ${ELEMENT_TH[partner.element]}`}
        className="mx-auto grid max-w-[520px] grid-cols-2 items-start gap-x-4 gap-y-3 sm:grid-cols-[minmax(0,1fr)_minmax(132px,170px)_minmax(0,1fr)] sm:gap-x-3 sm:gap-y-0"
      >
        <PersonColumn name={readerName} person={reader} className="col-start-1 row-start-2 sm:col-start-1 sm:row-start-1" />
        <motion.div
          className="relative col-span-2 row-start-1 mx-auto w-[132px] text-center sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:w-auto sm:-mt-9"
          initial={reduce ? false : { opacity: 0, y: 8, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <CompatibilityTalisman score={score} priority />
          <p className="-mt-3 flex items-baseline justify-center gap-1" aria-label={`ความเข้ากัน ${score} จาก 100`}>
            <strong className="font-heading text-5xl font-bold leading-none tracking-[-0.04em] text-ink tabular-nums">{score}</strong>
            <span className="font-mono text-xs font-medium text-inkMuted">/100</span>
          </p>
          <p className="mt-1 font-heading text-sm font-semibold leading-snug text-romanceText">{talisman.label}</p>
        </motion.div>
        <PersonColumn name={partnerName} person={partner} className="col-start-2 row-start-2 sm:col-start-3 sm:row-start-1" />
      </div>

      <h1
        id="report-archetype"
        className="mt-6 text-balance text-center font-heading text-[clamp(2rem,8.6vw,2.75rem)] font-bold leading-tight tracking-[-0.01em] text-ink"
      >
        {content.archetype.name}
      </h1>
      <p className="mx-auto mt-1 max-w-[30ch] text-balance text-center font-oracle text-base leading-relaxed text-inkMuted">
        <DisplayLine text={content.archetype.tagline} />
      </p>
      <p className="mt-5 text-pretty border-t border-edge pt-[18px] font-oracle text-lg leading-[1.7] text-ink">
        <ThaiText>{content.verdict}</ThaiText>
      </p>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-inkMuted">
        <span className="inline-flex items-center gap-1.5 font-heading font-semibold text-romanceText">
          <Heart className="size-4" aria-hidden="true" />
          {relationshipLabel}
        </span>
        {full && content.generatedOn && <span>{coverDate(content.generatedOn)}</span>}
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
