'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/lib-packages/ui';
import { CurrencyImage } from '@/components/ui/currency-image';
import { PackSheet } from '@/features/wallet/pack-sheet';
import { FeatureCreditCard } from '@/features/wallet/feature-credit-card';
import { WalletHistory } from '@/features/wallet/wallet-history';
import { TicketHistory } from '@/features/wallet/ticket-history';
import { useMiniShop } from '@/features/shop/mini-shop-provider';
import { enabledWallet, useWallet } from '@/features/wallet/use-wallet';
import { UNIT, WALLET_NAME } from '@/features/wallet/wallet-copy';
import { PageLoadingState } from '@/components/ui/page-loading-state';
import { useSession } from '@/lib/auth-client';

/** /dashboard/wallet: the มู balance, เติมมู (the sheet in store context), and the paginated history. */
export default function WalletPage() {
  const { data: session } = useSession();
  const userId = session?.user.id ?? null;
  const query = useWallet();
  const wallet = enabledWallet(query.data);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<'moo' | 'tickets'>('moo');
  const { openProduct } = useMiniShop();

  const changeHistoryTab = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const next = event.key === 'ArrowRight' || event.key === 'End' ? 'tickets' : event.key === 'ArrowLeft' || event.key === 'Home' ? 'moo' : null;
    if (!next) return;
    event.preventDefault();
    setHistoryTab(next);
    document.getElementById(`wallet-history-${next}`)?.focus();
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-ground pb-10">
      <div className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <h1 className="font-heading text-3xl font-semibold text-ink">{WALLET_NAME}</h1>
          <p className="mt-1 text-sm text-inkMuted">ยอดไว้ซื้อของในร้านสายมู</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 px-4 pt-6 sm:px-6">
        {query.isPending && <PageLoadingState className="min-h-72" label="กำลังเปิดกระเป๋ามูของคุณ" />}

        {query.isError && (
          <div className="rounded-xl border border-edge bg-surface px-4 py-5">
            <p className="text-ink">โหลดกระเป๋าไม่สำเร็จ</p>
            <Button type="button" variant="soft" onClick={() => query.refetch()} className="mt-3">
              ลองอีกครั้ง
            </Button>
          </div>
        )}

        {query.data?.enabled === false && <p className="text-inkMuted">ยังไม่เปิดใช้งาน</p>}

        {wallet && (
          <>
            <div className="grid gap-4 sm:grid-cols-2"><section aria-labelledby="wallet-balance" className="flex min-h-56 flex-col justify-between rounded-3xl border border-accent/15 bg-surface2 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 id="wallet-balance" className="font-heading text-sm font-semibold text-inkMuted">แต้มมูคงเหลือ</h2>
                  <p className="mt-1 font-heading text-4xl font-semibold text-ink">
                    <span className="font-mono tabular-nums">{wallet.balance.toLocaleString('th-TH')}</span> {UNIT}
                  </p>
                </div>
                <CurrencyImage size={88} />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Button type="button" size="lg" onClick={() => setSheetOpen(true)} aria-haspopup="dialog" className="min-h-12 w-full font-heading sm:w-auto">
                  เติม{UNIT}
                </Button>
                <Link href="/dashboard/shop?from=wallet" className="inline-flex min-h-11 items-center gap-1 rounded-lg font-heading text-sm font-semibold text-ink underline decoration-edge underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright">ดูร้านค้า <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
              </div>
            </section><FeatureCreditCard credit={wallet.tickets} onBuy={() => openProduct('heart_ticket', { entry: 'mini_shop' })} /></div>
            {userId && <PackSheet key={userId} userId={userId} open={sheetOpen} onOpenChange={setSheetOpen} wallet={wallet} context={{ kind: 'store' }} />}

            <section aria-labelledby="wallet-ledger">
              <h2 id="wallet-ledger" className="mb-3 font-heading text-lg font-semibold text-ink">
                ประวัติ
              </h2>
              <div role="tablist" aria-label="ประวัติกระเป๋า" className="mb-4 flex gap-6 border-b border-edge">
                <button id="wallet-history-moo" type="button" role="tab" aria-controls="wallet-history-panel" aria-selected={historyTab === 'moo'} tabIndex={historyTab === 'moo' ? 0 : -1} onClick={() => setHistoryTab('moo')} onKeyDown={changeHistoryTab} className={`min-h-11 border-b-2 px-1 font-heading font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${historyTab === 'moo' ? 'border-accent text-ink' : 'border-transparent text-inkMuted hover:text-ink'}`}>แต้มมู</button>
                <button id="wallet-history-tickets" type="button" role="tab" aria-controls="wallet-history-panel" aria-selected={historyTab === 'tickets'} tabIndex={historyTab === 'tickets' ? 0 : -1} onClick={() => setHistoryTab('tickets')} onKeyDown={changeHistoryTab} className={`min-h-11 border-b-2 px-1 font-heading font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${historyTab === 'tickets' ? 'border-accent text-ink' : 'border-transparent text-inkMuted hover:text-ink'}`}>ตั๋วรู้ใจ</button>
              </div>
              <div id="wallet-history-panel" role="tabpanel" aria-labelledby={`wallet-history-${historyTab}`}>
                {historyTab === 'moo' ? <WalletHistory /> : <TicketHistory />}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
