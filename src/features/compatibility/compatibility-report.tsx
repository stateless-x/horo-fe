import { AlertTriangle, CheckCircle2, ChevronDown, Lock, MinusCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/lib-packages/ui';
import type { RelationshipType } from '@/lib-packages/shared';
// Type-only: the v4 zod schemas must not reach the page bundle through this component.
import type {
  CompatibilityV4Content,
  CompatibilityV4Shaped,
  V4Chapter,
  V4MonthLabel,
} from '@/lib-packages/shared/types/compatibility-v4';
import { RELATIONSHIP_CONFIG } from '@/features/compatibility/relationship-config';

interface CompatibilityReportProps {
  score: number;
  /** Already shaped by `shapeCompatibilityView`: the teaser view has no overview, chapters, calendar or plan. */
  content: CompatibilityV4Shaped;
  relationshipType?: RelationshipType;
  readerName: string | null;
  partnerName: string;
  /** Renders the unlock button on the locked card. Not wired to payment yet. */
  onUnlock?: () => void;
}

const MONTH_LABEL: Record<V4MonthLabel, { text: string; icon: LucideIcon; tone: string }> = {
  good: { text: 'ดี', icon: CheckCircle2, tone: 'text-emerald-700 dark:text-emerald-400' },
  mixed: { text: 'กลาง', icon: MinusCircle, tone: 'text-inkMuted' },
  caution: { text: 'ระวัง', icon: AlertTriangle, tone: 'text-amber-700 dark:text-amber-400' },
};

const isFull = (content: CompatibilityV4Shaped): content is CompatibilityV4Content => 'overview' in content;

function monthName(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString('th-TH', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** The plan's day N as a date, counted from the day the report was written. */
function planDate(generatedOn: string, day: number): string {
  const [year, month, date] = generatedOn.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, date + day - 1)).toLocaleDateString('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function Chapter({ chapter }: { chapter: V4Chapter }) {
  return (
    <article className="border-t border-edge py-5">
      <h3 className="font-heading text-lg font-semibold text-ink">{chapter.title}</h3>
      <p className="mt-2 max-w-[65ch] font-thai leading-relaxed text-ink">{chapter.summary}</p>
      <details className="group mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 font-heading text-sm font-semibold text-accentBright [&::-webkit-details-marker]:hidden">
          อ่านเจาะลึก
          <ChevronDown className="size-4 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-2 max-w-[65ch] space-y-4 font-thai leading-relaxed text-ink">
          <p className="font-oracle text-lg font-light leading-[1.8]">{chapter.detail}</p>
          {chapter.pairs && (
            <ol className="space-y-3">
              {chapter.pairs.map((pair, index) => (
                <li key={index}>
                  <p><span className="font-heading font-semibold">ทำ </span>{pair.do}</p>
                  <p className="text-inkMuted"><span className="font-heading font-semibold">เลี่ยง </span>{pair.avoid}</p>
                </li>
              ))}
            </ol>
          )}
          {chapter.lines && (
            <div>
              <h4 className="font-heading font-semibold">ประโยคที่ส่งได้เลย</h4>
              <List items={chapter.lines} />
            </div>
          )}
          {chapter.scenarios && (
            <ol className="space-y-3">
              {chapter.scenarios.map((item, index) => (
                <li key={index}>
                  <p>{item.scenario}</p>
                  <p className="text-inkMuted"><span className="font-heading font-semibold">คืนดีด้วย </span>{item.repair}</p>
                </li>
              ))}
            </ol>
          )}
          {chapter.goSignals && (
            <div>
              <h4 className="font-heading font-semibold">สัญญาณว่าไปต่อได้</h4>
              <List items={chapter.goSignals} />
            </div>
          )}
          {chapter.slowSignals && (
            <div>
              <h4 className="font-heading font-semibold">สัญญาณว่าควรชะลอ</h4>
              <List items={chapter.slowSignals} />
            </div>
          )}
          {chapter.nextStep && (
            <p>
              <span className="font-heading font-semibold">ขั้นต่อไป · {monthName(chapter.nextStep.month)} </span>
              {chapter.nextStep.step}
            </p>
          )}
          <p className="rounded-xl bg-surface2 p-3">
            <span className="font-heading font-semibold">ลองทำ </span>
            {chapter.move}
          </p>
        </div>
      </details>
    </article>
  );
}

/**
 * Compatibility report (content v4), structural version: cover, score bars,
 * then, in the full view, overview, six chapters, the 3-month calendar and
 * the 7-day plan. The polished layout comes from the owner's approved
 * mockup; this component fixes the data shape and the teaser/full split.
 */
export function CompatibilityReport({ score, content, relationshipType, readerName, partnerName, onUnlock }: CompatibilityReportProps) {
  const accent = relationshipType ? RELATIONSHIP_CONFIG[relationshipType].accent : 'text-accentBright';
  const accentBorder = relationshipType ? RELATIONSHIP_CONFIG[relationshipType].accentBorder : 'border-accentBright/30';
  const full = isFull(content) ? content : null;
  const lines = full?.overview.dimensionLines;

  return (
    <section aria-labelledby="report-verdict" className={`overflow-hidden rounded-2xl border bg-surface ${accentBorder}`}>
      <header className="space-y-3 bg-surface2 p-5 md:p-7">
        <p className="font-heading text-sm text-inkMuted">
          {readerName ?? 'คุณ'} กับ {partnerName}
        </p>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="font-heading tabular-nums text-ink" aria-label={`ความเข้ากัน ${score} เปอร์เซ็นต์`}>
            <span className="text-5xl font-semibold">{score}</span>
            <span className="ml-1 text-lg text-inkMuted">%</span>
          </p>
          <div>
            <p className={`font-heading text-xl font-semibold ${accent}`}>{content.archetype.name}</p>
            <p className="font-thai text-sm text-inkMuted">{content.archetype.tagline}</p>
          </div>
        </div>
        <h2 id="report-verdict" className="text-balance font-heading text-xl font-semibold text-ink md:text-2xl">
          {content.cover.verdict}
        </h2>
      </header>

      <div className="space-y-6 p-5 md:p-7">
        <section aria-labelledby="report-dimensions">
          <h3 id="report-dimensions" className="font-heading text-lg font-semibold text-ink">คะแนนรายด้าน</h3>
          <dl className="mt-3 space-y-4">
            {content.dimensions.map((dimension) => (
              <div key={dimension.key}>
                <div className="flex items-baseline justify-between gap-3 font-heading">
                  <dt className="text-ink">{dimension.label}</dt>
                  <dd className="tabular-nums text-ink">{dimension.score}</dd>
                </div>
                <div className="mt-1 h-2 rounded-full bg-surface2" aria-hidden="true">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${dimension.score}%` }} />
                </div>
                {lines ? (
                  <p className="mt-1.5 max-w-[65ch] font-thai text-sm leading-relaxed text-inkMuted">{lines[dimension.key]}</p>
                ) : (
                  <p className="mt-1.5 flex items-center gap-1.5 font-thai text-sm text-inkMuted">
                    <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                    ความหมายของคะแนนนี้อยู่ในฉบับเต็ม
                  </p>
                )}
              </div>
            ))}
          </dl>
        </section>

        {!full && (
          <section aria-labelledby="report-locked" className={`rounded-2xl border bg-surface2 p-5 ${accentBorder}`}>
            <h3 id="report-locked" className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
              <Lock className={`size-5 shrink-0 ${accent}`} aria-hidden="true" />
              ในรายงานฉบับเต็ม
            </h3>
            <ul className="mt-3 space-y-3">
              {content.cover.lockedHints.map((hint) => (
                <li key={hint.chapter} className="flex items-start gap-3 font-thai leading-relaxed text-ink">
                  <Lock className="mt-1 size-4 shrink-0 text-inkMuted" aria-hidden="true" />
                  {hint.text}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-thai text-sm text-inkMuted">
              พร้อมภาพรวมของคู่นี้ 6 บทเจาะลึก ปฏิทินความสัมพันธ์ 3 เดือน และแผน 7 วัน
            </p>
            {onUnlock && (
              <Button onClick={onUnlock} className="mt-4 w-full sm:w-auto">
                อ่านรายงานฉบับเต็ม
              </Button>
            )}
          </section>
        )}

        {full && (
          <>
            <section aria-labelledby="report-overview">
              <h3 id="report-overview" className="font-heading text-lg font-semibold text-ink">ภาพรวม</h3>
              <p className="mt-2 max-w-[65ch] font-oracle text-lg font-light leading-[1.8] text-ink">{full.overview.story}</p>
            </section>

            <section aria-label="บทในรายงาน">
              {full.chapters.map((chapter) => (
                <Chapter key={chapter.key} chapter={chapter} />
              ))}
            </section>

            <section aria-labelledby="report-calendar">
              <h3 id="report-calendar" className="font-heading text-lg font-semibold text-ink">ปฏิทินความสัมพันธ์ 3 เดือน</h3>
              <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                {full.calendar.map((month) => {
                  const label = MONTH_LABEL[month.label];
                  return (
                    <li key={month.month} className="rounded-2xl border border-edge p-4">
                      <p className="font-heading font-semibold text-ink">{monthName(month.month)}</p>
                      <p className={`mt-1 flex items-center gap-1.5 font-heading font-semibold ${label.tone}`}>
                        <label.icon className="size-4" aria-hidden="true" />
                        {label.text}
                      </p>
                      <p className="mt-2 font-thai text-sm leading-relaxed text-ink">{month.text}</p>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section aria-labelledby="report-plan">
              <h3 id="report-plan" className="font-heading text-lg font-semibold text-ink">แผน 7 วัน</h3>
              <ol className="mt-3 space-y-4">
                {full.plan.map((step) => (
                  <li key={step.day} className="rounded-2xl border border-edge p-4 font-thai leading-relaxed">
                    <p className="font-heading font-semibold text-ink">
                      วันที่ {step.day} · {planDate(full.generatedOn, step.day)}
                    </p>
                    <p className="mt-1 text-ink">{step.action}</p>
                    <p className="mt-2 text-inkMuted">
                      <span className="font-heading font-semibold">ลองพูด </span>
                      {step.conversationStarter}
                    </p>
                    <p className="mt-1 text-inkMuted">
                      <span className="font-heading font-semibold">หลังจากนั้นสังเกต </span>
                      {step.watchFor}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </div>
    </section>
  );
}
