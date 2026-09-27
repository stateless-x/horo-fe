'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/lib-packages/ui';
import { LedgerList } from '@/features/wallet/ledger-list';
import { PackList } from '@/features/wallet/pack-list';
import { enabledWallet, useWallet } from '@/features/wallet/use-wallet';
import { UNIT, baht, units } from '@/features/wallet/wallet-copy';

/** /dashboard/wallet: the มู balance, the packs, and the newest ledger rows. */
export default function WalletPage() {
  const query = useWallet();
  const wallet = enabledWallet(query.data);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-ground pb-10">
      <div className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <h1 className="font-heading text-2xl font-semibold text-ink">{UNIT}ของคุณ</h1>
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
                <Sparkles className="size-4" aria-hidden="true" />
                ยอดคงเหลือ
              </h2>
              <p className="mt-1 font-heading text-4xl font-semibold text-ink">
                <span className="font-mono tabular-nums">{wallet.balance.toLocaleString('th-TH')}</span> {UNIT}
              </p>
              <p className="mt-1 text-sm text-inkMuted">
                เท่ากับ {baht(wallet.balance)} · ปลดล็อกดวงคู่ 1 คนใช้ {units(wallet.prices.compat_unlock)}
              </p>
            </section>

            <section aria-labelledby="wallet-packs">
              <h2 id="wallet-packs" className="mb-3 font-heading text-lg font-semibold text-ink">
                เติม{UNIT}
              </h2>
              <PackList packs={wallet.packs} />
            </section>

            <section aria-labelledby="wallet-ledger">
              <h2 id="wallet-ledger" className="mb-3 font-heading text-lg font-semibold text-ink">
                ความเคลื่อนไหว
              </h2>
              <LedgerList entries={wallet.ledger} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
