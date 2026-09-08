import { ChevronDown, Lightbulb, ShieldAlert, Sparkles } from 'lucide-react';
import type { RelationshipType } from '@/lib-packages/shared';
import type { CompatibilityStructuredContent } from '@/lib-packages/shared/types/reading';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { RELATIONSHIP_CONFIG } from '@/features/compatibility/relationship-config';

interface CompatibilityReadingProps {
  score: number;
  analysis: string;
  structuredContent?: CompatibilityStructuredContent | null;
  relationshipType?: RelationshipType;
  onGuidanceOpen?: () => void;
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

export function CompatibilityReading({ score, analysis, structuredContent, relationshipType, onGuidanceOpen }: CompatibilityReadingProps) {
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
  const accentBg = relationshipConfig?.accentBg ?? 'bg-accent/10';
  const accentBorder = relationshipConfig?.accentBorder ?? 'border-accentBright/30';

  return (
    <section aria-labelledby="compatibility-verdict" className={`overflow-hidden rounded-2xl border bg-surface shadow-[0_18px_50px_rgba(107,33,168,0.08)] ${accentBorder}`}>
      <div className={`grid gap-4 p-5 md:grid-cols-[9rem_1fr] md:items-center md:p-7 ${accentBg}`}>
        <div className="font-heading text-ink tabular-nums" aria-label={`ความเข้ากัน ${score} เปอร์เซ็นต์`}>
          <p className="text-sm text-inkMuted">ความเข้ากัน</p>
          <p className="mt-1">
            <span className="text-5xl font-semibold tracking-tight">{score}</span>
            <span className="ml-1 text-lg text-inkMuted">%</span>
          </p>
        </div>
        <div>
          <h2 id="compatibility-verdict" className="text-balance font-heading text-xl font-semibold text-ink md:text-2xl">
            {structuredContent.verdict}
          </h2>
          <p className="mt-2 max-w-[65ch] font-thai leading-relaxed text-inkMuted">
            {structuredContent.scoreExplanation}
          </p>
        </div>
      </div>

      <div className="divide-y divide-edge px-5 md:px-7">
        {(Object.keys(SECTION_ICONS) as Array<keyof typeof SECTION_ICONS>).map((key) => {
          const Icon = SECTION_ICONS[key];
          return (
            <div key={key} className="grid gap-3 py-5 md:grid-cols-[10rem_1fr] md:gap-6 md:py-6">
              <h3 className="flex items-center gap-2 font-heading font-semibold text-ink">
                <Icon className={`size-5 shrink-0 ${accent}`} aria-hidden="true" />
                {sectionLabels[key]}
              </h3>
              <p className="max-w-[65ch] font-oracle text-lg font-light leading-[1.8] text-ink">{structuredContent[key]}</p>
            </div>
          );
        })}

        {structuredContent.nextSteps && (
          <div className="py-5 md:py-6">
            <div className="grid gap-3 md:grid-cols-[10rem_1fr] md:gap-6">
              <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
                <Lightbulb className={`size-5 shrink-0 ${accent}`} aria-hidden="true" />
                ลองทำต่อจากนี้
              </h3>
              <p className="max-w-[65ch] font-thai leading-relaxed text-ink">
                {structuredContent.nextSteps.action}
              </p>
            </div>

            <details
              className="group mt-4 rounded-xl border border-edge bg-surface2"
              onToggle={(event) => {
                if (event.currentTarget.open) onGuidanceOpen?.();
              }}
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 font-heading font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright focus-visible:ring-offset-2 focus-visible:ring-offset-surface [&::-webkit-details-marker]:hidden">
                ประโยคชวนคุยและสิ่งที่ลองสังเกต
                <ChevronDown className={`size-5 shrink-0 group-open:rotate-180 ${accent}`} aria-hidden="true" />
              </summary>
              <div className="space-y-4 border-t border-edge px-4 py-4">
                <div>
                  <h4 className="font-heading font-semibold text-ink">ประโยคที่ลองใช้ได้</h4>
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
      </div>
    </section>
  );
}
