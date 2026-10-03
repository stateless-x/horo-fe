'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Button, buttonVariants, cn } from '@/lib-packages/ui';
import { HeartKnowingTicket } from '@/components/ui/heart-knowing-ticket';
import { COMPATIBILITY_DASHBOARD_PATH } from '@/features/compatibility/compatibility-routes';
import { useTrackEvent } from '@/lib/analytics';
import { useMiniShop } from '@/features/shop/mini-shop-provider';
import { shopProductCopy } from '@/features/shop/shop-copy';
import { useShop } from '@/features/shop/use-shop';
import { PageLoadingState } from '@/components/ui/page-loading-state';
import { enabledWallet, useWallet } from '@/features/wallet/use-wallet';
import type { ShopEntry } from '@/lib-packages/shared/types/analytics';
import type { ShopProduct } from '@/lib-packages/shared/types/shop';

const ENTRY_VALUES = new Set<ShopEntry>(['nav', 'door', 'wallet', 'link']);

function categoryLabel(name: string) {
  return name === 'eTicket' ? 'ตั๋ว' : name;
}

function ProductCard({ product, ticketsOwned, featured, onChoose }: { product: ShopProduct; ticketsOwned: number; featured: boolean; onChoose: () => void }) {
  const price = product.offers.length ? Math.min(...product.offers.map((offer) => offer.priceMoo)) : null;
  const isTicket = product.imageKey === 'heart-knowing';
  const canUseTicket = isTicket && ticketsOwned > 0;
  const copy = shopProductCopy(product);

  return (
    <article className={`overflow-hidden rounded-3xl border border-edge bg-surface shadow-[0_16px_44px_rgb(107_33_168/0.06)] ${featured ? 'md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]' : 'flex flex-col'}`}>
      <div className={`grid place-items-center bg-surface2 px-6 py-5 sm:py-8 ${featured ? 'min-h-44 sm:min-h-56 md:min-h-[25rem] md:px-8' : 'min-h-44'}`}>
        {isTicket ? (
          <HeartKnowingTicket size={featured ? 384 : 256} className={`w-full object-contain ${featured ? 'max-w-[13rem] sm:max-w-[20rem] md:max-w-[24rem]' : 'max-w-[13rem]'}`} />
        ) : (
          <ShoppingBag className="size-16 text-accentSoft" strokeWidth={1.25} aria-hidden="true" />
        )}
      </div>
      <div className={`flex flex-1 flex-col p-5 sm:p-7 ${featured ? 'md:justify-center md:p-9' : ''}`}>
        <h2 className={`font-heading font-semibold leading-tight text-ink ${featured ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>{product.name}</h2>
        <p className="mt-3 max-w-prose text-base leading-relaxed text-inkMuted">{copy.lead}</p>
        {product.featureId === 'compat_unlock' && (
          <p className="mt-4 text-sm text-inkMuted">{ticketsOwned > 0 ? `คุณมี${product.name} ${ticketsOwned.toLocaleString('th-TH')} ใบ` : `ยังไม่มี${product.name}`}</p>
        )}
        <div className="mt-6 border-t border-edge pt-5">
          {price !== null && <p className="font-heading text-xl font-semibold text-ink">เริ่ม {price.toLocaleString('th-TH')} มู</p>}
          {canUseTicket ? (
            <div className="mt-4 flex flex-col items-stretch gap-1 sm:items-start">
              <Link
                href={COMPATIBILITY_DASHBOARD_PATH}
                className={cn(buttonVariants({ size: 'lg' }), 'min-h-12 w-full gap-2 font-heading sm:w-auto sm:min-w-48')}
              >
                ไปดูดวงคู่
                <ArrowUpRight className="size-5" aria-hidden="true" />
              </Link>
              <Button type="button" variant="ghost" className="min-h-11 w-full gap-2 font-heading sm:w-auto" onClick={onChoose} aria-haspopup="dialog">
                <ShoppingCart className="size-4" aria-hidden="true" /> ซื้อตั๋วเพิ่ม
              </Button>
            </div>
          ) : (
            <Button type="button" size="lg" className="mt-4 min-h-12 w-full gap-2 font-heading sm:w-auto sm:min-w-48" onClick={onChoose} aria-haspopup="dialog">
              <ShoppingCart className="size-5" aria-hidden="true" /> {isTicket ? 'เลือกจำนวนตั๋ว' : 'ดูตัวเลือก'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ShopPage() {
  const walletQuery = useWallet();
  const wallet = enabledWallet(walletQuery.data);
  const shop = useShop(Boolean(wallet));
  const search = useSearchParams();
  const track = useTrackEvent();
  const viewed = useRef(false);
  const { openProduct } = useMiniShop();
  const categories = useMemo(() => shop.data?.categories ?? [], [shop.data]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const active = categories.find((category) => category.id === categoryId) ?? categories[0];
  const hasCategoryNavigation = categories.length > 1;
  const entry = useMemo<ShopEntry>(() => { const value = search.get('from') as ShopEntry | null; return value && ENTRY_VALUES.has(value) ? value : 'nav'; }, [search]);

  useEffect(() => {
    if (!wallet || viewed.current) return;
    viewed.current = true;
    track({ event: 'shop_viewed', surface: 'shop', entry });
  }, [entry, track, wallet]);

  if (walletQuery.isPending) return <PageLoadingState className="min-h-[calc(100vh-3.5rem)]" label="กำลังเปิดร้านสายมู" />;
  if (walletQuery.isError) return <div className="mx-auto max-w-5xl px-4 py-8"><p role="alert">โหลดร้านไม่สำเร็จ</p><Button variant="soft" className="mt-3" onClick={() => walletQuery.refetch()}>ลองอีกครั้ง</Button></div>;
  if (!wallet) return null;
  if (shop.isPending) return <PageLoadingState className="min-h-[calc(100vh-3.5rem)]" label="กำลังเตรียมสินค้าในร้าน" />;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-ground pb-12">
      <header className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9">
          <h1 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">ร้านสายมู</h1>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 pt-5 sm:px-6 sm:pt-7">
        {shop.isError && <div className="rounded-xl border border-edge bg-surface p-5"><p>โหลดร้านไม่สำเร็จ</p><Button variant="soft" className="mt-3" onClick={() => shop.refetch()}>ลองอีกครั้ง</Button></div>}
        {shop.isSuccess && categories.length === 0 && <div className="rounded-2xl border border-edge bg-surface px-5 py-12 text-center"><h2 className="font-heading text-xl font-semibold">กำลังเตรียมของดีๆ</h2><p className="mt-2 text-sm text-inkMuted">แวะมาใหม่ได้เลย</p></div>}
        {active && (
          <>
            {hasCategoryNavigation && <div className="mb-6 border-b border-edge sm:mb-8">
              <div role="tablist" aria-label="หมวดสินค้า" className="flex min-w-0 gap-6 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    id={`shop-tab-${category.id}`}
                    aria-controls="shop-products"
                    aria-selected={active.id === category.id}
                    tabIndex={active.id === category.id ? 0 : -1}
                    onClick={() => setCategoryId(category.id)}
                    onKeyDown={(event) => {
                      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                      event.preventDefault();
                      const index = categories.findIndex((item) => item.id === category.id);
                      const next = event.key === 'Home' ? 0 : event.key === 'End' ? categories.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + categories.length) % categories.length;
                      setCategoryId(categories[next].id);
                      document.getElementById(`shop-tab-${categories[next].id}`)?.focus();
                    }}
                    className={`min-h-12 shrink-0 border-b-2 px-1 font-heading text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${active.id === category.id ? 'border-accent text-ink' : 'border-transparent text-inkMuted hover:text-ink'}`}
                  >
                    {categoryLabel(category.name)}
                  </button>
                ))}
              </div>
            </div>}
            <section
              id="shop-products"
              role={hasCategoryNavigation ? 'tabpanel' : undefined}
              aria-labelledby={hasCategoryNavigation ? `shop-tab-${active.id}` : undefined}
            >
              {active.products.length === 0 ? (
                <p className="py-8 text-sm text-inkMuted">หมวดนี้ยังไม่มีสินค้า</p>
              ) : (
                <div className={active.products.length === 1 ? '' : 'grid gap-5 md:grid-cols-2'}>
                  {active.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      ticketsOwned={wallet.tickets.usesLeft}
                      featured={active.products.length === 1}
                      onChoose={() => openProduct(product.id, { entry: 'shop' })}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
