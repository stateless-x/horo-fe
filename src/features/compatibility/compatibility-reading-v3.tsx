import { ChevronDown, Clock, HeartHandshake, Lightbulb, Lock, MessageCircle, Sparkles, Sprout, UserRound, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/lib-packages/ui';
import type { RelationshipType } from '@/lib-packages/shared';
import type {
  CompatibilityV3DetailSection,
  CompatibilityV3Shaped,
  CompatibilityV3TimingBasis,
} from '@/lib-packages/shared/types/compatibility-v3';
import { RELATIONSHIP_CONFIG } from '@/features/compatibility/relationship-config';

interface CompatibilityReadingV3Props {
  score: number;
  /** Already shaped by `shapeCompatibilityView`: `detail` is absent in the teaser view. */
  content: CompatibilityV3Shaped;
  relationshipType?: RelationshipType;
  onGuidanceOpen?: () => void;
  /**
   * Renders the unlock button on the locked card. Not wired to payment yet;
   * without it the card still shows what the full reading answers.
   */
  onUnlock?: () => void;
}

const SECTION_META: Record<CompatibilityV3DetailSection, { label: string; icon: LucideIcon }> = {
  dynamic: { label: 'ภาพรวมของคู่นี้', icon: Sparkles },
  understandingPartner: { label: 'เข้าใจอีกฝ่าย', icon: HeartHandshake },
  yourSide: { label: 'มุมของคุณ', icon: UserRound },
  communication: { label: 'คุยอย่างไรให้ถึงกัน', icon: MessageCircle },
  friction: { label: 'ถ้าเกิดเรื่องนี้', icon: Wrench },
  timing: { label: 'จังหวะที่เหมาะ', icon: Clock },
  longTerm: { label: 'ระยะยาว', icon: Sprout },
};

const TIMING_BASIS_LABELS: Record<CompatibilityV3TimingBasis, string> = {
  p1ThaiDay: 'วันเกิดของคุณ',
  p1Planet: 'ดาวประจำวันเกิดของคุณ',
  p1Element: 'ธาตุของคุณ',
  p2ThaiDay: 'วันเกิดของอีกฝ่าย',
  p2Planet: 'ดาวประจำวันเกิดของอีกฝ่าย',
  p2Element: 'ธาตุของอีกฝ่าย',
};

function SectionRow({ section, accent, children }: { section: CompatibilityV3DetailSection; accent: string; children: ReactNode }) {
  const { label, icon: Icon } = SECTION_META[section];
  return (
    <div className="grid gap-3 py-5 md:grid-cols-[10rem_1fr] md:gap-6 md:py-6">
      <h3 className="flex items-center gap-2 font-heading font-semibold text-ink">
        <Icon className={`size-5 shrink-0 ${accent}`} aria-hidden="true" />
        {label}
      </h3>
      <div className="max-w-[65ch]">{children}</div>
    </div>
  );
}

const prose = 'font-oracle text-lg font-light leading-[1.8] text-ink';

/**
 * Compatibility content v3. The same component renders both views of one
 * stored reading: the teaser view shows the verdict, the hook and a locked
 * card naming what the full reading answers; the full view adds every detail
 * section. Which view it gets is decided before it renders, by the shaped
 * content it receives, so it never holds text it should not show.
 */
export function CompatibilityReadingV3({ score, content, relationshipType, onGuidanceOpen, onUnlock }: CompatibilityReadingV3Props) {
  const config = relationshipType ? RELATIONSHIP_CONFIG[relationshipType] : null;
  const accent = config?.accent ?? 'text-accentBright';
  const accentBg = config?.accentBg ?? 'bg-accent/10';
  const accentBorder = config?.accentBorder ?? 'border-accentBright/30';
  const { teaser, detail } = content;

  return (
    <section
      aria-labelledby="compatibility-verdict"
      className={`overflow-hidden rounded-2xl border bg-surface shadow-[0_18px_50px_rgba(107,33,168,0.08)] ${accentBorder}`}
    >
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
            {teaser.verdict}
          </h2>
          <p className="mt-2 max-w-[65ch] font-thai leading-relaxed text-inkMuted">{content.scoreExplanation}</p>
        </div>
      </div>

      <div className="px-5 pt-5 md:px-7 md:pt-6">
        <p className={prose}>{teaser.hook}</p>
      </div>

      {!detail && (
        <div className="p-5 md:p-7">
          <div className={`rounded-2xl border bg-surface2 p-5 md:p-6 ${accentBorder}`}>
            <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
              <Lock className={`size-5 shrink-0 ${accent}`} aria-hidden="true" />
              ในดวงคู่ฉบับเต็ม
            </h3>
            <ul className="mt-4 space-y-3">
              {teaser.lockedHints.map((hint) => (
                <li key={hint.section} className="flex items-start gap-3">
                  <Lock className="mt-1 size-4 shrink-0 text-inkMuted" aria-hidden="true" />
                  <span className="font-thai leading-relaxed text-ink">{hint.text}</span>
                </li>
              ))}
            </ul>
            {onUnlock && (
              <Button onClick={onUnlock} className="mt-5 w-full sm:w-auto">
                อ่านดวงคู่ฉบับเต็ม
              </Button>
            )}
          </div>
        </div>
      )}

      {detail && (
        <div className="divide-y divide-edge px-5 md:px-7">
          <SectionRow section="dynamic" accent={accent}>
            <p className={prose}>{detail.dynamic}</p>
          </SectionRow>
          <SectionRow section="understandingPartner" accent={accent}>
            <p className={prose}>{detail.understandingPartner}</p>
          </SectionRow>
          <SectionRow section="yourSide" accent={accent}>
            <p className={prose}>{detail.yourSide}</p>
          </SectionRow>
          <SectionRow section="communication" accent={accent}>
            <ol className="space-y-4">
              {detail.communication.map((tip, index) => (
                <li key={index} className="space-y-1 font-thai leading-relaxed">
                  <p className="text-ink">
                    <span className="font-heading font-semibold">ทำ </span>
                    {tip.do}
                  </p>
                  <p className="text-inkMuted">
                    <span className="font-heading font-semibold">เลี่ยง </span>
                    {tip.avoid}
                  </p>
                </li>
              ))}
            </ol>
          </SectionRow>
          <SectionRow section="friction" accent={accent}>
            <ol className="space-y-4">
              {detail.friction.map((item, index) => (
                <li key={index} className="space-y-1 font-thai leading-relaxed">
                  <p className="text-ink">{item.scenario}</p>
                  <p className="text-inkMuted">
                    <span className="font-heading font-semibold">ซ่อมได้ด้วย </span>
                    {item.repair}
                  </p>
                </li>
              ))}
            </ol>
          </SectionRow>
          <SectionRow section="timing" accent={accent}>
            <p className={prose}>{detail.timing.advice}</p>
            <p className="mt-2 text-sm text-inkMuted">
              อ้างอิงจาก {detail.timing.basis.map((key) => TIMING_BASIS_LABELS[key]).join(' · ')}
            </p>
          </SectionRow>
          <SectionRow section="longTerm" accent={accent}>
            <p className={prose}>{detail.longTerm}</p>
          </SectionRow>

          <div className="py-5 md:py-6">
            <div className="grid gap-3 md:grid-cols-[10rem_1fr] md:gap-6">
              <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
                <Lightbulb className={`size-5 shrink-0 ${accent}`} aria-hidden="true" />
                ลองทำต่อจากนี้
              </h3>
              <p className="max-w-[65ch] font-thai leading-relaxed text-ink">{detail.nextSteps.action}</p>
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
                    {detail.nextSteps.conversationStarter}
                  </p>
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-ink">หลังจากนั้นลองสังเกต</h4>
                  <p className="mt-1 max-w-[65ch] font-thai leading-relaxed text-inkMuted">
                    {detail.nextSteps.watchFor}
                  </p>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </section>
  );
}
