'use client';

import { useState } from 'react';
import { Button } from '@/lib-packages/ui';
import { CurrencyImage } from '@/components/ui/currency-image';
import { PackSheet } from '@/features/wallet/pack-sheet';
import { WalletHistory } from '@/features/wallet/wallet-history';
import { enabledWallet, useWallet } from '@/features/wallet/use-wallet';
import { UNIT, WALLET_NAME, baht, units } from '@/features/wallet/wallet-copy';

/** /dashboard/wallet: the มู balance, เติมมู (the sheet in store context), and the paginated history. */
export default function WalletPage() {
  const query = useWallet();
  const wallet = enabledWallet(query.data);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-ground pb-10">
      <div className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <h1 className="font-heading text-2xl font-semibold text-ink">{WALLET_NAME}</h1>
          <p className="mt-1 text-sm text-inkMuted">1 {UNIT} = ฿1 · ใช้ได้ในสายมูเท่านั้น ถอนเป็นเงินหรือโอนให้คนอื่นไม่ได้</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-2xl gap-8 px-4 pt-6">
        {query.isPending && <p className="text-inkMuted">กำลังโหลด...</p>}

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
            <section aria-labelledby="wallet-balance" className="rounded-2xl border border-edge bg-surface px-5 py-5">
              <h2 id="wallet-balance" className="flex items-center gap-2 text-sm text-inkMuted">
                <CurrencyImage size={24} />
                ยอดคงเหลือ
              </h2>
              <p className="mt-1 font-heading text-4xl font-semibold text-ink">
                <span className="font-mono tabular-nums">{wallet.balance.toLocaleString('th-TH')}</span> {UNIT}
              </p>
              <p className="mt-1 text-sm text-inkMuted">
                เท่ากับ {baht(wallet.balance)} · ปลดล็อกดวงคู่ 1 คนใช้ {units(wallet.prices.compat_unlock)}
              </p>
              <Button type="button" size="lg" onClick={() => setSheetOpen(true)} aria-haspopup="dialog" className="mt-4 min-h-12 w-full font-heading sm:w-auto">
                เติม{UNIT}
              </Button>
            </section>
            <PackSheet open={sheetOpen} onOpenChange={setSheetOpen} wallet={wallet} context={{ kind: 'store' }} />

            <section aria-labelledby="wallet-ledger">
              <h2 id="wallet-ledger" className="mb-3 font-heading text-lg font-semibold text-ink">
                ความเคลื่อนไหว
              </h2>
              <WalletHistory />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
