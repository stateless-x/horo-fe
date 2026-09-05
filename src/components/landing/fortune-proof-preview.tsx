import { ElementClayImage } from '@/components/ui/element-clay-image';

/**
 * Illustrative values shaped like real output: the chart's per-area scores are
 * computed deterministically on 0-100 (horo-be/lib/astrology/chart-scores.ts),
 * so these are representative of what a real reading produces.
 */
const scores = [
  { label: 'ความรัก', value: 91 },
  { label: 'การงาน', value: 74 },
  { label: 'การเงิน', value: 60 },
] as const;

export function FortuneProofPreview() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-edge bg-surface p-5 shadow-[0_20px_60px_rgba(107,33,168,0.10)] sm:p-7">
      <div className="absolute -right-20 -top-16 size-56 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex h-full flex-col">
        <p className="font-mono text-xs tracking-wider text-inkMuted">ตัวอย่างดวงชะตา</p>
        <h3 className="mt-2 font-heading text-2xl font-semibold text-ink sm:text-3xl">
          ดวงของ มินตรา
        </h3>
        <p className="mt-1 text-sm text-inkMuted">ธาตุไม้ · INFP · อายุ 24 ปี</p>

        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-edge bg-surface2 p-4">
          <ElementClayImage
            element="wood"
            alt="โมเดลดินปั้นต้นไม้แทนธาตุไม้"
            sizes="96px"
            className="size-20 shrink-0 sm:size-24"
          />
          <div>
            <p className="font-heading text-lg font-semibold text-[var(--el-wood)]">ไม้หยิน</p>
            <p className="mt-1 text-xs leading-relaxed text-inkMuted sm:text-sm">
              อ่อนโยน ยืดหยุ่น และเติบโตได้ดีเมื่อมีพื้นที่ของตัวเอง
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {scores.map((score) => (
            <div key={score.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-ink">{score.label}</span>
                <span className="font-mono text-inkMuted">{score.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-overlay">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accentSoft"
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto rounded-xl border border-accent/15 bg-accent/5 p-4">
          <p className="font-oracle text-sm leading-relaxed text-ink">
            เดือนนี้พลังไม้ของคุณกำลังผลิยอดใหม่ โอกาสที่ใช่จะเริ่มจากบทสนทนาเล็ก ๆ
          </p>
        </div>
      </div>
    </div>
  );
}
