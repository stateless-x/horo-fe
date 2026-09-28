import { ChevronDown, HeartHandshake, Lightbulb, ShieldAlert, Sparkles } from 'lucide-react';
import type { RelationshipType } from '@/lib-packages/shared';
import type { CompatibilityStructuredContent } from '@/lib-packages/shared/types/reading';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { ElementClayImage, type ClayElement } from '@/components/ui/element-clay-image';
import type { CompatibilityV4Shaped } from '@/lib-packages/shared/types/compatibility';
import { RELATIONSHIP_CONFIG, toThaiElement } from '@/features/compatibility/relationship-config';
import { CompatibilityReport } from '@/features/compatibility/compatibility-report';
import { CompatibilityTalisman, compatibilityTalismanBand } from '@/features/compatibility/report/compatibility-talisman';

interface CompatibilityReadingProps {
  score: number;
  analysis: string;
  /** Historical v2 content, or the current report shaped for one view. */
  structuredContent?: CompatibilityStructuredContent | CompatibilityV4Shaped | null;
  relationshipType?: RelationshipType;
  onGuidanceOpen?: () => void;
  /** The current teaser view: shows the unlock button on the locked card. */
  onUnlock?: () => void;
  /** v4 cover. The partner's name is required to render a v4 report. */
  readerName?: string | null;
  partnerName?: string;
  readerElement?: string;
  readerDayMaster?: string;
  partnerElement?: string;
  partnerDayMaster?: string;
  relationshipTitle?: string;
  relationshipLabel?: string;
}

const SECTION_ICONS = {
  chemistry: Sparkles,
  caution: ShieldAlert,
  advice: Lightbulb,
} as const;

const DEFAULT_SECTION_LABELS = {
  chemistry: 'จังหวะของความสัมพันธ์',
  caution: 'เรื่องที่ควรคุยให้ชัด',
  advice: 'แนวทางที่ช่วยได้',
} as const;

const SECTION_LABELS: Record<RelationshipType, Record<keyof typeof SECTION_ICONS, string>> = {
  romantic: {
    chemistry: 'จังหวะความรัก',
    caution: 'เรื่องที่ควรคุยให้ชัด',
    advice: 'วิธีดูแลความสัมพันธ์',
  },
  talking: {
    chemistry: 'จังหวะที่คุยกัน',
    caution: 'เรื่องที่ควรดูให้ชัด',
    advice: 'วิธีค่อย ๆ ไปต่อ',
  },
  friend: {
    chemistry: 'จังหวะของมิตรภาพ',
    caution: 'เรื่องที่ควรเช็กใจกัน',
    advice: 'วิธีดูแลเพื่อนคนนี้',
  },
  boss: {
    chemistry: 'จังหวะทำงานร่วมกัน',
    caution: 'เรื่องที่ควรตกลงให้ชัด',
    advice: 'วิธีคุยกับหัวหน้า',
  },
  coworker: {
    chemistry: 'จังหวะทำงานร่วมกัน',
    caution: 'เรื่องที่ควรแบ่งให้ชัด',
    advice: 'วิธีประสานงานกัน',
  },
  family: {
    chemistry: 'จังหวะที่เข้าใจกัน',
    caution: 'ความคาดหวังที่ควรคุย',
    advice: 'วิธีวางขอบเขตด้วยความเคารพ',
  },
};

const CLAY_ELEMENTS: ClayElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];

function isClayElement(value: string | undefined): value is ClayElement {
  return !!value && CLAY_ELEMENTS.includes(value.toLowerCase() as ClayElement);
}

function LegacyPerson({
  name,
  element,
  dayMaster,
}: {
  name: string;
  element?: string;
  dayMaster?: string;
}) {
  const clayElement = isClayElement(element) ? (element.toLowerCase() as ClayElement) : null;
  return (
    <div className="min-w-0 text-center">
      {clayElement && (
        <ElementClayImage
          element={clayElement}
          alt={`โมเดลดินปั้น ธาตุ${toThaiElement(element)}`}
          sizes="(min-width: 640px) 72px, 58px"
          className="mx-auto size-[58px] sm:size-[72px]"
        />
      )}
      <p title={name} className="mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-heading font-semibold text-ink">
        {name}
      </p>
      {element && <p className="text-sm text-inkMuted">ธาตุ{toThaiElement(element)}</p>}
      {dayMaster && <p className="hidden text-xs text-inkMuted sm:block">{dayMaster}</p>}
    </div>
  );
}

export function CompatibilityReading({
  score,
  analysis,
  structuredContent,
  relationshipType,
  onGuidanceOpen,
  onUnlock,
  readerName,
  partnerName,
  readerElement,
  readerDayMaster,
  partnerElement,
  partnerDayMaster,
  relationshipTitle,
  relationshipLabel,
}: CompatibilityReadingProps) {
  if (structuredContent?.contentVersion === 4) {
    if (!partnerName) throw new Error('A v4 compatibility report needs the partner name');
    return (
      <CompatibilityReport
        score={score}
        content={structuredContent}
        relationshipType={relationshipType}
        readerName={readerName ?? null}
        partnerName={partnerName}
        onUnlock={onUnlock}
        embedded
      />
    );
  }

  if (!structuredContent) {
    return (
      <section aria-labelledby="legacy-reading-title" className="rounded-2xl border border-edge bg-surface p-5 md:p-7">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-edge pb-5">
          <div>
            <h2 id="legacy-reading-title" className="font-heading text-xl text-ink">เรื่องราวของคู่นี้</h2>
            <p className="mt-1 text-sm text-inkMuted">ค่อย ๆ อ่าน แล้วเลือกเก็บมุมที่ช่วยให้เข้าใจกันมากขึ้น</p>
          </div>
          <p className="font-heading text-ink tabular-nums" aria-label={`คะแนนจากผลรูปแบบเดิม ${score} เต็ม 100`}>
            <span className="text-3xl font-semibold">{score}</span>
            <span className="text-sm text-inkMuted">/100</span>
          </p>
        </div>
        <MarkdownRenderer content={analysis} />
      </section>
    );
  }

  const sectionLabels = relationshipType ? SECTION_LABELS[relationshipType] : DEFAULT_SECTION_LABELS;
  const relationshipConfig = relationshipType ? RELATIONSHIP_CONFIG[relationshipType] : null;
  const accent = relationshipConfig?.accent ?? 'text-accentBright';
  const talisman = compatibilityTalismanBand(score);
  const resolvedPartnerName = partnerName ?? 'อีกฝ่าย';

  return (
    <div className="space-y-10 sm:space-y-14">
      <section
        aria-labelledby="compatibility-verdict"
        className="relative overflow-hidden rounded-[1.75rem] border border-romance/20 bg-[linear-gradient(150deg,var(--surface),color-mix(in_srgb,var(--color-romance)_9%,var(--surface2)))] px-5 pb-6 pt-7 shadow-[0_22px_60px_-42px_rgba(107,33,168,0.42)] sm:px-8 sm:pb-8 sm:pt-9"
      >
        <div className="text-center">
          {relationshipLabel && (
            <p className="mx-auto w-fit rounded-full bg-romance/10 px-3 py-1 font-heading text-sm font-semibold text-romanceText">
              {relationshipLabel}
            </p>
          )}
          <h1 className="mx-auto mt-3 max-w-[24ch] text-balance font-heading text-[clamp(1.75rem,7vw,2.75rem)] font-bold leading-tight tracking-[-0.02em] text-ink">
            {relationshipTitle ?? `ดวงคู่ของคุณกับ${resolvedPartnerName}`}
          </h1>
        </div>

        <div className="mx-auto mt-6 grid max-w-[34rem] grid-cols-2 items-start gap-x-5 gap-y-3 sm:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)] sm:gap-x-3">
          <LegacyPerson name={readerName ?? 'คุณ'} element={readerElement} dayMaster={readerDayMaster} />
          <div className="col-span-2 row-start-1 mx-auto w-36 text-center sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:-mt-2 sm:w-40">
            <CompatibilityTalisman score={score} priority />
            <p className="-mt-3 flex items-baseline justify-center gap-1 font-heading text-ink tabular-nums" aria-label={`ความเข้ากัน ${score} จาก 100`}>
              <strong className="text-5xl font-bold leading-none tracking-[-0.04em]">{score}</strong>
              <span className="text-sm text-inkMuted">/100</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-romanceText">{talisman.label}</p>
          </div>
          <LegacyPerson name={resolvedPartnerName} element={partnerElement} dayMaster={partnerDayMaster} />
        </div>

        <div className="mt-6 border-t border-romance/20 pt-5 text-center sm:mt-7 sm:pt-6">
          <h2 id="compatibility-verdict" className="text-balance font-heading text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {talisman.headline}
          </h2>
          <p className="mx-auto mt-2 max-w-[54ch] font-oracle text-lg font-light leading-[1.75] text-ink">
            {structuredContent.verdict}
          </p>
          <p className="mx-auto mt-2 max-w-[58ch] text-sm leading-relaxed text-inkMuted">
            {structuredContent.scoreExplanation}
          </p>
        </div>
      </section>

      <section aria-labelledby="compatibility-details" className="mx-auto w-full max-w-[48rem]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="compatibility-details" className="font-heading text-2xl font-bold leading-snug text-ink">
              ถ้าอยากไปต่อ ควรรู้อะไรบ้าง
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-inkMuted">เปิดอ่านเฉพาะเรื่องที่คุณอยากรู้ตอนนี้ได้เลย</p>
          </div>
          <HeartHandshake className="hidden size-7 shrink-0 text-romanceText sm:block" aria-hidden="true" />
        </div>

        <div className="mt-4 border-y border-edge">
          {(Object.keys(SECTION_ICONS) as Array<keyof typeof SECTION_ICONS>).map((key, index) => {
            const Icon = SECTION_ICONS[key];
            return (
              <details key={key} open={index === 0} className="group border-b border-edge last:border-b-0">
                <summary className="grid min-h-16 cursor-pointer list-none grid-cols-[24px_minmax(0,1fr)_20px] items-center gap-3 rounded-lg px-1 py-3 font-heading font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright [&::-webkit-details-marker]:hidden">
                  <Icon className={`size-5 ${accent}`} aria-hidden="true" />
                  <span>{sectionLabels[key]}</span>
                  <ChevronDown className="size-5 text-inkMuted transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                </summary>
                <p className="max-w-[65ch] pb-5 pl-9 pr-2 font-oracle text-lg font-light leading-[1.8] text-ink">
                  {structuredContent[key]}
                </p>
              </details>
            );
          })}
        </div>

        {structuredContent.nextSteps && (
          <div className="mt-8 rounded-2xl bg-surface2 px-5 py-5 sm:px-6">
            <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
              <Lightbulb className={`mt-0.5 size-5 ${accent}`} aria-hidden="true" />
              <div>
                <h3 className="font-heading text-lg font-bold text-ink">เริ่มจากเรื่องนี้ก่อน</h3>
                <p className="mt-1 max-w-[65ch] leading-relaxed text-ink">
                  {structuredContent.nextSteps.action}
                </p>
              </div>
            </div>

            <details
              className="group mt-4 border-t border-edge pt-2"
              onToggle={(event) => {
                if (event.currentTarget.open) onGuidanceOpen?.();
              }}
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 font-heading font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright [&::-webkit-details-marker]:hidden">
                ขอประโยคไว้เริ่มคุย
                <ChevronDown className={`size-5 shrink-0 group-open:rotate-180 ${accent}`} aria-hidden="true" />
              </summary>
              <div className="space-y-4 pb-1 pt-3">
                <div>
                  <h4 className="font-heading font-semibold text-ink">ส่งแบบนี้ได้เลย</h4>
                  <p className="mt-1 max-w-[65ch] font-thai leading-relaxed text-inkMuted">
                    {structuredContent.nextSteps.conversationStarter}
                  </p>
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-ink">หลังจากนั้นลองสังเกต</h4>
                  <p className="mt-1 max-w-[65ch] font-thai leading-relaxed text-inkMuted">
                    {structuredContent.nextSteps.watchFor}
                  </p>
                </div>
              </div>
            </details>
          </div>
        )}
      </section>
    </div>
  );
}
