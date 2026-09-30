'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/lib-packages/ui';
import { HeartKnowingTicket } from '@/components/ui/heart-knowing-ticket';
import { api, type ApiError } from '@/lib/api';
import type { TicketPassId } from '@/lib-packages/shared/types/wallet';
import { PackSheet } from '@/features/wallet/pack-sheet';
import { enabledWallet, useWallet } from '@/features/wallet/use-wallet';
import { compatibilityResultPath } from '@/features/compatibility/compatibility-routes';

const PASSES: Array<{ id: TicketPassId; tickets: number; price: number; note: string; recommended?: boolean }> = [
  { id: 'compat_ticket_1', tickets: 1, price: 49, note: 'พอดีกับคำอ่านนี้' },
  { id: 'compat_ticket_3', tickets: 3, price: 98, note: 'รับเพิ่ม 1 ใบ', recommended: true },
];

/** The one place readers buy ตั๋วรู้ใจ. The return URL is always the report named by unlockRef. */
export default function ShopPage() {
  const walletQuery = useWallet();
  const wallet = enabledWallet(walletQuery.data);
  const search = useSearchParams();
  const router = useRouter();
  const unlockRef = search.get('unlockRef');
  const [buying, setBuying] = useState<TicketPassId | null>(null);
  const [topup, setTopup] = useState<TicketPassId | null>(null);

  const goToReport = () => {
    if (unlockRef) router.replace(`${compatibilityResultPath(unlockRef)}?unlocking=1`);
    else router.push('/dashboard/compatibility');
  };

  const buy = async (pass: TicketPassId) => {
    if (!wallet || !unlockRef) return;
    setBuying(pass);
    try {
      await api.post('/api/wallet/tickets/buy', { passId: pass, unlockRef });
      goToReport();
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 402) setTopup(pass);
      else console.error('Ticket purchase failed', error);
    } finally {
      setBuying(null);
    }
  };

  const selected = PASSES.find((pass) => pass.id === topup);
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-ground pb-10">
      <div className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <p className="text-sm font-medium text-accent">ร้านสายมู</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-ink">ตั๋วรู้ใจ</h1>
          <p className="mt-1 text-sm leading-relaxed text-inkMuted">ใช้เปิดคำอ่านดวงคู่ 1 คนต่อ 1 ใบ ตั๋วที่ซื้อไม่มีวันหมดอายุ</p>
        </div>
      </div>
      <main className="mx-auto max-w-2xl px-4 pt-6">
        {!unlockRef && <p className="rounded-xl border border-edge bg-surface px-4 py-3 text-sm text-inkMuted">เลือกคำอ่านดวงคู่ที่อยากเปิดก่อน แล้วกลับมาซื้อตั๋วได้ที่นี่</p>}
        {walletQuery.isPending && <p className="text-inkMuted">กำลังโหลดร้าน...</p>}
        {wallet && <div className="grid gap-3 sm:grid-cols-2">
          {PASSES.map((pass) => <section key={pass.id} className={`relative overflow-hidden rounded-2xl border bg-surface p-5 ${pass.recommended ? 'border-accent shadow-[0_10px_30px_rgba(125,56,219,0.14)]' : 'border-edge'}`}>
            {pass.recommended && <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">คุ้มสุด</span>}
            <HeartKnowingTicket size={160} className="ml-auto -mr-4 -mt-5 h-24 w-36" />
            <h2 className="font-heading text-xl font-semibold text-ink">{pass.tickets} ตั๋วรู้ใจ</h2>
            <p className="mt-1 text-sm text-inkMuted">{pass.note}</p>
            <p className="mt-4 font-heading text-2xl font-semibold text-ink">{pass.price} มู</p>
            <Button type="button" size="lg" className="mt-4 w-full font-heading" disabled={!unlockRef || buying !== null} onClick={() => void buy(pass.id)}>
              {buying === pass.id ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} ใช้ตั๋วนี้เปิดคำอ่าน
            </Button>
          </section>)}
        </div>}
        {wallet && <p className="mt-5 flex items-center gap-2 text-sm text-inkMuted"><Check className="size-4 text-accent" /> ยอดคงเหลือ {wallet.balance} มู</p>}
      </main>
      {wallet && selected && unlockRef && <PackSheet open onOpenChange={(open) => !open && setTopup(null)} wallet={wallet} context={{ kind: 'ticket', passId: selected.id, price: selected.price, unlockRef }} onPaid={async () => goToReport()} />}
    </div>
  );
}
