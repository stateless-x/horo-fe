'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/lib-packages/ui';
import { HeartKnowingTicket } from '@/components/ui/heart-knowing-ticket';
import { api, type ApiError } from '@/lib/api';
import { useTrackEvent } from '@/lib/analytics';
import type { CatalogProductId, PurchaseResponse, ShopOffer } from '@/lib-packages/shared/types/shop';
import { enabledWallet, useWallet, WALLET_QUERY_KEY } from './use-wallet';
import { useShopProduct } from '@/features/shop/use-shop';
import type { MiniShopEntry } from '@/features/shop/mini-shop-provider';
import { PackSheet } from './pack-sheet';

export function MiniShopDialog({ userId, open, onOpenChange, productId, entry, unlockRef, resumeOffer, onPurchased }: {
  userId: string | null;
  open: boolean; onOpenChange: (open: boolean) => void; productId: CatalogProductId | null;
  entry: MiniShopEntry; unlockRef?: string; resumeOffer?: ShopOffer; onPurchased: () => Promise<void> | void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const track = useTrackEvent();
  const productQuery = useShopProduct(productId, open);
  const walletQuery = useWallet();
  const wallet = enabledWallet(walletQuery.data);
  const product = productQuery.data?.product;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [retryKey, setRetryKey] = useState<string | null>(null);
  const [topup, setTopup] = useState<{ userId: string; offer: ShopOffer } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const openedProductId = useRef<string | null>(null);

  useEffect(() => { const element = dialog.current; if (!element) return; if (open && !element.open) element.showModal(); if (!open && element.open) element.close(); }, [open]);
  useEffect(() => { if (resumeOffer && userId) setTopup({ userId, offer: resumeOffer }); }, [resumeOffer, userId]);
  useEffect(() => {
    if (!open) { openedProductId.current = null; setCompleted(false); return; }
    if (!product || openedProductId.current === product.id) return;
    openedProductId.current = product.id;
    setCompleted(false);
    setSelectedId(product.offers.find((offer) => offer.badges.includes('recommended'))?.id ?? product.offers[0]?.id ?? null);
    setNotice(null); setRetryKey(null);
    track({ event: 'product_viewed', surface: 'shop', productId: product.id, entry });
  }, [open, product, entry, track]);

  const selected = product?.offers.find((offer) => offer.id === selectedId);
  const close = () => onOpenChange(false);
  const buy = async (key = retryKey ?? crypto.randomUUID()) => {
    if (!selected || !wallet || buying || completed) return;
    setBuying(true); setNotice(null); setRetryKey(key);
    try {
      await api.post<PurchaseResponse>('/api/shop/purchases', { offerId: selected.id, expectedPriceMoo: selected.priceMoo, idempotencyKey: key });
    } catch (error) {
      const refused = error as ApiError;
      if (refused.status === 402 && refused.body?.error === 'insufficient_balance' && userId) { setRetryKey(null); setTopup({ userId, offer: selected }); }
      else if (refused.status === 409 && refused.body?.error === 'price_changed') { setRetryKey(null); setNotice('ราคาเปลี่ยนแล้ว ตรวจสอบราคาใหม่ก่อนแลก'); await productQuery.refetch(); }
      else if (refused.status === 404) { setRetryKey(null); setNotice('ข้อเสนอนี้ไม่พร้อมใช้งานแล้ว'); await productQuery.refetch(); }
      else setNotice('แลกตั๋วไม่สำเร็จ ลองอีกครั้ง');
      setBuying(false);
      return;
    }
    setRetryKey(null);
    setCompleted(true);
    try {
      await queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
      await onPurchased();
    } catch (error) {
      console.error('Purchase succeeded, but completing the Shop flow failed:', error);
      setNotice('แลกตั๋วสำเร็จแล้ว แต่เปิดหน้าถัดไปไม่สำเร็จ ลองเปิดจากประวัติอีกครั้ง');
    } finally { setBuying(false); }
  };

  return <>
    <dialog ref={dialog} aria-labelledby="mini-shop-title" onClose={close} onClick={(event) => event.target === event.currentTarget && close()} className="m-0 mt-auto max-h-[100dvh] w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-ground/70 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-lg">
      {open && <div className="max-h-[100dvh] overflow-y-auto rounded-t-2xl border border-edge bg-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3"><h2 id="mini-shop-title" className="font-heading text-xl font-semibold">{product?.name ?? 'กำลังโหลด'}</h2><button type="button" aria-label="ปิด" onClick={close} className="grid size-11 shrink-0 place-items-center rounded-lg text-inkMuted hover:bg-edgeSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"><X className="size-5" /></button></div>
        {productQuery.isPending && <p className="mt-8 flex items-center justify-center gap-2 text-inkMuted"><Loader2 className="size-5 animate-spin" /> กำลังโหลดข้อเสนอ</p>}
        {productQuery.isError && <div className="mt-5 rounded-xl border border-edge p-4"><p>โหลดสินค้าไม่สำเร็จ</p><Button variant="soft" className="mt-3" onClick={() => productQuery.refetch()}>ลองอีกครั้ง</Button></div>}
        {product && <>
          {product.imageKey === 'heart-knowing' && <HeartKnowingTicket size={160} className="mx-auto my-3 h-28 w-48" />}
          <OfferChoices offers={product.offers} selectedId={selectedId} onSelect={(offer) => {
            setSelectedId(offer.id);
            setRetryKey(null);
            setNotice(null);
            track({ event: 'offer_selected', surface: 'shop', productId: product.id, offerId: offer.id });
          }} />
          <p className="mt-4 text-sm text-inkMuted">มี {wallet?.balance.toLocaleString('th-TH') ?? '—'} มู</p>
          {notice && <p role="alert" className="mt-3 text-sm text-danger">{notice}</p>}
          <Button type="button" size="lg" className="mt-4 w-full gap-2 font-heading" disabled={!selected || !wallet || buying || completed} onClick={() => void buy()}>{buying ? <Loader2 className="size-5 animate-spin" /> : <ShoppingCart className="size-5" />} {completed ? 'ซื้อตั๋วสำเร็จแล้ว' : selected ? `ซื้อด้วย ${selected.priceMoo} มู` : 'เลือกจำนวนตั๋ว'}</Button>
        </>}
      </div>}
    </dialog>
    {userId && wallet && topup?.userId === userId && productId && <PackSheet key={userId} userId={userId} open onOpenChange={(next) => !next && setTopup(null)} wallet={wallet} context={{ kind: 'catalog', productId, offer: topup.offer, unlockRef }} onCatalogStale={(reason) => { setTopup(null); setNotice(reason === 'price' ? 'ราคาเปลี่ยนแล้ว ตรวจสอบราคาใหม่ก่อนแลก' : 'ข้อเสนอนี้ไม่พร้อมใช้งานแล้ว'); void productQuery.refetch(); }} onPaid={async () => { setTopup(null); await onPurchased(); }} />}
  </>;
}

/** Catalog-driven choices: a future published 10-ticket offer needs no UI release. */
export function OfferChoices({ offers, selectedId, onSelect }: { offers: ShopOffer[]; selectedId: string | null; onSelect: (offer: ShopOffer) => void }) {
  return (
    <div role="radiogroup" aria-label="เลือกจำนวนตั๋ว" className="grid gap-2">
      {offers.map((offer) => {
        const chosen = selectedId === offer.id;
        return (
          <button
            key={offer.id}
            type="button"
            role="radio"
            aria-checked={chosen}
            aria-label={`${offer.units} ใบ ${offer.priceMoo} มู${offer.badges.includes('recommended') ? ' แนะนำ' : ''}`}
            onClick={() => onSelect(offer)}
            className={`block min-h-16 w-full rounded-xl border px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${chosen ? 'border-accent bg-accent/10' : 'border-edge bg-surface hover:bg-edgeSoft'}`}
          >
            <span className="flex items-center gap-3">
              <span className={`size-4 shrink-0 rounded-full border-4 ${chosen ? 'border-accent bg-accent' : 'border-edge bg-surface'}`} />
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="shrink-0 font-heading font-semibold tabular-nums">{offer.units} ใบ</span>
                {offer.badges.includes('recommended') && <span className="rounded-full bg-accent px-2 py-0.5 font-heading text-xs font-semibold text-accentInk">แนะนำ</span>}
              </span>
              <span className="shrink-0 font-heading font-semibold tabular-nums">{offer.priceMoo} มู</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
