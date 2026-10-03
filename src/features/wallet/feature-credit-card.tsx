import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { HeartKnowingTicket } from '@/components/ui/heart-knowing-ticket';
import { COMPATIBILITY_DASHBOARD_PATH } from '@/features/compatibility/compatibility-routes';
import { Button, buttonVariants, cn } from '@/lib-packages/ui';
import type { TicketsSummary } from '@/lib-packages/shared/types/shop';

/** A ticket is a feature-specific right, not a second wallet balance. */
export function FeatureCreditCard({ credit, onBuy }: { credit: TicketsSummary; onBuy: () => void }) {
  return (
    <section aria-labelledby="feature-credit-compat" className="flex min-h-56 flex-col justify-between rounded-3xl border border-romance/20 bg-surface px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="feature-credit-compat" className="font-heading text-sm font-semibold text-inkMuted">
            ตั๋วรู้ใจ
          </h2>
          <p className="mt-1 font-heading text-4xl font-semibold text-ink">
            <span className="font-mono tabular-nums">{credit.usesLeft.toLocaleString('th-TH')}</span> ใบ
          </p>
        </div>
        <HeartKnowingTicket size={96} className="pointer-events-none w-20 shrink-0 sm:w-24" />
      </div>
      <div className="mt-5">
        <p className="text-sm text-inkMuted">เปิดดวงคู่ฉบับเต็ม</p>
        {credit.expiring.map((grant) => <p key={`${grant.expiresAt}:${grant.source}`} className="mt-1 text-sm text-romanceText">{grant.uses} ใบ หมดอายุ {new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok' }).format(new Date(grant.expiresAt))}</p>)}
        {credit.usesLeft > 0 ? (
          <div className="mt-3 flex flex-col items-stretch gap-1 sm:items-start">
            <Link
              href={COMPATIBILITY_DASHBOARD_PATH}
              className={cn(buttonVariants({ size: 'lg' }), 'min-h-12 w-full gap-2 font-heading sm:w-auto')}
            >
              ไปดูดวงคู่
              <ArrowUpRight className="size-5" aria-hidden="true" />
            </Link>
            <Button type="button" variant="ghost" onClick={onBuy} className="min-h-11 w-full font-heading sm:w-auto">
              ซื้อตั๋วเพิ่ม
            </Button>
          </div>
        ) : (
          <Button type="button" onClick={onBuy} className="mt-3 min-h-12 w-full font-heading sm:w-auto">
            ซื้อตั๋ว
          </Button>
        )}
      </div>
    </section>
  );
}
