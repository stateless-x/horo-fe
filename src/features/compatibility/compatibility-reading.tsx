import { Lightbulb, ShieldAlert, Sparkles } from 'lucide-react';
import type { CompatibilityStructuredContent } from '@/lib-packages/shared/types/reading';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

interface CompatibilityReadingProps {
  score: number;
  analysis: string;
  structuredContent?: CompatibilityStructuredContent | null;
}

const SECTIONS = [
  { key: 'chemistry', label: 'เคมีของคู่นี้', icon: Sparkles },
  { key: 'caution', label: 'จุดที่ต้องระวัง', icon: ShieldAlert },
  { key: 'advice', label: 'ลองทำแบบนี้', icon: Lightbulb },
] as const;

export function CompatibilityReading({ score, analysis, structuredContent }: CompatibilityReadingProps) {
  if (!structuredContent) {
    return (
      <section aria-labelledby="legacy-reading-title" className="rounded-2xl border border-edge bg-surface p-5 md:p-7">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-edge pb-5">
          <div>
            <h2 id="legacy-reading-title" className="font-heading text-xl text-ink">คำวิเคราะห์จากดวงดาว</h2>
            <p className="mt-1 text-sm text-inkMuted">ผลรูปแบบเดิม รายละเอียดจึงยาวกว่าผลรุ่นใหม่</p>
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

  return (
    <section aria-labelledby="compatibility-verdict" className="overflow-hidden rounded-2xl border border-pink-400/30 bg-surface shadow-lg shadow-accent/10">
      <div className="grid gap-4 bg-pink-500/10 p-5 md:grid-cols-[7rem_1fr] md:items-center md:p-7">
        <p className="font-heading text-ink tabular-nums" aria-label={`คะแนนความเข้ากันได้ ${score} เต็ม 100`}>
          <span className="text-5xl font-semibold tracking-tight">{score}</span>
          <span className="text-sm text-inkMuted">/100</span>
        </p>
        <div>
          <h2 id="compatibility-verdict" className="text-balance font-heading text-xl font-semibold text-ink md:text-2xl">
            {structuredContent.verdict}
          </h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-inkMuted">
            {structuredContent.scoreExplanation}
          </p>
        </div>
      </div>

      <div className="divide-y divide-edge px-5 md:px-7">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="grid gap-3 py-5 md:grid-cols-[10rem_1fr] md:gap-6 md:py-6">
            <h3 className="flex items-center gap-2 font-heading font-semibold text-ink">
              <Icon className="size-5 shrink-0 text-pink-600 dark:text-pink-400" aria-hidden="true" />
              {label}
            </h3>
            <p className="max-w-[65ch] leading-7 text-ink">{structuredContent[key]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
