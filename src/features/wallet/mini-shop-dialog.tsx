'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/lib-packages/ui';
import { api, type ApiError } from '@/lib/api';
import type { TicketPassId, WalletState } from '@/lib-packages/shared/types/wallet';
import { HeartKnowingTicket } from '@/components/ui/heart-knowing-ticket';
import { PackSheet } from './pack-sheet';

export type MiniShopProduct = {
  id: TicketPassId;
  title: string;
  price: number;
  detail: string;
  badge?: string;
};

const DEFAULT_TICKET_PRODUCTS: MiniShopProduct[] = [
  { id: 'compat_ticket_1', title: 'ตั๋วรู้ใจ 1 ใบ', price: 49, detail: 'พอดีกับคำอ่านนี้' },
  { id: 'compat_ticket_3', title: 'ตั๋วรู้ใจ 3 ใบ', price: 98, detail: 'รับเพิ่ม 1 ใบ', badge: 'คุ้มสุด' },
];

/** A focused catalogue surface for contextual purchases; the full shop remains available for browsing. */
export function MiniShopDialog({ open, onOpenChange, wallet, unlockRef, products = DEFAULT_TICKET_PRODUCTS, onPurchased }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: WalletState;
  unlockRef: string;
  products?: MiniShopProduct[];
  onPurchased: () => Promise<void> | void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [buying, setBuying] = useState<TicketPassId | null>(null);
  const [topup, setTopup] = useState<MiniShopProduct | null>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  const buy = async (product: MiniShopProduct) => {
    setBuying(product.id);
    try {
      await api.post('/api/wallet/tickets/buy', { passId: product.id, unlockRef });
      onOpenChange(false);
      await onPurchased();
    } catch (error) {
      if ((error as ApiError).status === 402) setTopup(product);
      else console.error('Mini shop purchase failed', error);
    } finally {
      setBuying(null);
    }
  };

  return <>
    <dialog ref={dialog} aria-labelledby="mini-shop-title" onClose={() => onOpenChange(false)} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-edge bg-surface p-0 text-ink shadow-2xl backdrop:bg-ground/70 backdrop:backdrop-blur-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3"><div><h2 id="mini-shop-title" className="font-heading text-xl font-semibold">เลือกตั๋วรู้ใจ</h2><p className="mt-1 text-sm leading-relaxed text-inkMuted">ใช้ตั๋ว 1 ใบเพื่อเปิดคำอ่านนี้</p></div><button type="button" aria-label="ปิด" onClick={() => onOpenChange(false)} className="rounded-lg p-2 text-inkMuted hover:bg-edgeSoft"><X className="size-5" /></button></div>
        <div className="mt-4 grid gap-3">
          {products.map((product) => <section key={product.id} className={`relative flex items-center gap-3 rounded-xl border p-3 ${product.badge ? 'border-accent' : 'border-edge'}`}>
            {product.badge && <span className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">{product.badge}</span>}
            <HeartKnowingTicket size={96} className="w-20 shrink-0" />
            <div className="min-w-0 flex-1"><h3 className="font-heading font-semibold">{product.title}</h3><p className="text-sm text-inkMuted">{product.detail}</p><p className="mt-1 font-semibold">{product.price} มู</p></div>
            <Button type="button" size="sm" disabled={buying !== null} onClick={() => void buy(product)}>{buying === product.id ? <Loader2 className="size-4 animate-spin" /> : 'เลือก'}</Button>
          </section>)}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-inkMuted"><span>มี {wallet.balance} มู</span><Link href={`/dashboard/shop?tab=tickets&unlockRef=${encodeURIComponent(unlockRef)}`} className="font-medium text-accent hover:underline">ดูที่ร้าน</Link></div>
      </div>
    </dialog>
    {topup && <PackSheet open onOpenChange={(next) => !next && setTopup(null)} wallet={wallet} context={{ kind: 'ticket', passId: topup.id, price: topup.price, unlockRef }} onPaid={async () => { setTopup(null); onOpenChange(false); await onPurchased(); }} />}
  </>;
}
