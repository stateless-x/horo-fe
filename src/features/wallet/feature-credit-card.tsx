import { HeartKnowingTicket } from '@/components/ui/heart-knowing-ticket';
import type { FeatureCreditSummary } from '@/lib-packages/shared/types/wallet';

/** A ticket is a feature-specific right, not a second wallet balance. */
export function FeatureCreditCard({ credit }: { credit: FeatureCreditSummary }) {
  return (
    <section aria-labelledby={`feature-credit-${credit.featureId}`} className="relative overflow-hidden rounded-2xl border border-romance/25 bg-surface px-5 py-5">
      <HeartKnowingTicket size={160} className="pointer-events-none absolute -right-8 -top-5 w-44 opacity-90 sm:-right-5 sm:w-52" />
      <div className="relative max-w-[13rem]">
        <h2 id={`feature-credit-${credit.featureId}`} className="font-heading text-lg font-semibold text-ink">
          ตั๋วรู้ใจ
        </h2>
        <p className="mt-1 font-heading text-3xl font-semibold text-ink">
          เหลือ <span className="font-mono tabular-nums">{credit.usesLeft.toLocaleString('th-TH')}</span> ใบ
        </p>
        <p className="mt-2 text-sm leading-relaxed text-inkMuted">ใช้เปิดคำอ่านความสัมพันธ์</p>
      </div>
    </section>
  );
}
