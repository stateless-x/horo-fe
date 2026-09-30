import type { CSSProperties, ReactNode } from 'react';
import { ChevronDown, Sprout } from 'lucide-react';
import { ElementClayImage } from '@/components/ui/element-clay-image';
import type { V4Chapter } from '@/lib-packages/shared/types/compatibility';
import { DisplayLine, ELEMENT_TH, paragraphs, REPORT_CARD, type ReportElement } from './report-kit';

export interface ChapterCue {
  label: string;
  actionLabel: string;
  detailLabel?: string;
  collapseLabel?: string;
  icon: ReactNode;
}

interface ChapterCardProps {
  chapter: V4Chapter;
  /** Partner and reader chapters take their element; relationship chapters use the semantic context tone. */
  tone: ReportElement | 'accent' | 'romance';
  open: boolean;
  onToggle: () => void;
  /** The kit parts under the detail (basis facts, do/avoid, lines, scenarios, signals, next month). */
  kit?: ReactNode;
  /** A short, situational cue that helps a reader choose the right kind of advice. */
  cue?: ChapterCue;
}

/**
 * ChapterCard: title and summary always visible; the pull quote,
 * detail and the chapter's kit open under "รายละเอียด"; the one move to try
 * sits in the card's foot.
 */
export function ChapterCard({ chapter, tone, open, onToggle, kit, cue }: ChapterCardProps) {
  const toneText = tone === 'romance' ? 'var(--romance-text)' : tone === 'accent' ? 'var(--accent)' : `var(--el-${tone})`;
  const toneStyle = { '--chapter-tone': toneText } as CSSProperties;
  const regionId = `ch-${chapter.key}-more`;
  return (
    <article
      id={`ch-${chapter.key}`}
      aria-labelledby={`ch-${chapter.key}-title`}
      className={`${REPORT_CARD} scroll-mt-32 overflow-clip px-5 pt-5 sm:px-7 sm:pt-[26px] min-[1120px]:scroll-mt-20`}
    >
      <header>
        <div className="flex items-center gap-3">
          <h2
            id={`ch-${chapter.key}-title`}
            tabIndex={-1}
            className="min-w-0 flex-1 font-heading text-xl font-semibold leading-snug text-ink focus:outline-none"
          >
            <DisplayLine text={chapter.title} />
          </h2>
          {tone !== 'romance' && tone !== 'accent' && (
            <ElementClayImage element={tone} alt={`ธาตุ${ELEMENT_TH[tone]}`} sizes="30px" className="size-[30px] shrink-0" />
          )}
        </div>
        {cue && (
          <span style={toneStyle} className="mt-2 inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--chapter-tone)_25%,transparent)] bg-[color:color-mix(in_srgb,var(--chapter-tone)_7%,transparent)] px-2.5 font-heading text-xs font-medium text-[var(--chapter-tone)]">
            {cue.icon}
            {cue.label}
          </span>
        )}
      </header>
      <p className="mt-3 leading-[1.75] text-ink">
        {chapter.summary}
      </p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={onToggle}
        className="mt-[18px] flex min-h-11 w-full items-center justify-between rounded-md border border-edge bg-surface2 px-4 font-heading text-sm font-semibold text-ink transition-colors hover:bg-edge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
      >
        {open ? (cue?.collapseLabel ?? 'ย่อเนื้อหา') : (cue?.detailLabel ?? 'รายละเอียด')}
        <ChevronDown className={`size-4 transition-transform duration-300 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div
        id={regionId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-5">
            <blockquote className="relative mb-5 pl-[30px] font-oracle text-xl font-light leading-[1.6] text-ink">
              <span aria-hidden="true" className="absolute -top-[0.08em] left-0 font-oracle text-4xl font-normal leading-none" style={{ color: toneText }}>
                &ldquo;
              </span>
              <p>
                {chapter.pullQuote}
              </p>
            </blockquote>
            {paragraphs(chapter.detail).map((paragraph, i) => (
              <p key={i} className="mb-[1em] max-w-[62ch] font-oracle text-lg font-light leading-[1.8] text-ink last:mb-0">
                {paragraph}
              </p>
            ))}
            {kit}
          </div>
        </div>
      </div>
      <footer style={toneStyle} className="-mx-5 mt-5 grid grid-cols-[24px_minmax(0,1fr)] gap-3 border-t border-edge bg-surface2/70 px-5 pb-[18px] pt-4 sm:-mx-7 sm:mt-[22px] sm:px-7 sm:pb-5 sm:pt-[18px]">
        <Sprout className="mt-0.5 size-5 text-[var(--chapter-tone)]" aria-hidden="true" />
        <div>
          <p className="font-heading text-sm font-semibold leading-snug text-[var(--chapter-tone)]">{cue?.actionLabel ?? 'ลองทำ'}</p>
          <p className="mt-0.5 font-medium leading-[1.7] text-ink">
            {chapter.move}
          </p>
        </div>
      </footer>
    </article>
  );
}
