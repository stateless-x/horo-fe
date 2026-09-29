'use client';

import Link from 'next/link';
import { CurrencyImage } from '@/components/ui/currency-image';
import { enabledWallet, useWallet } from './use-wallet';
import { UNIT, WALLET_NAME } from './wallet-copy';

/** Crystal + "49" in the app header, linking to /dashboard/wallet. Nothing until the balance is known, or while the wallet is off. */
export function BalanceChip() {
  const data = enabledWallet(useWallet().data);
  if (!data) return null;
  return (
    <Link
      href="/dashboard/wallet"
      aria-label={`ยอด ${data.balance} ${UNIT} เปิด${WALLET_NAME}`}
      className="flex h-11 items-center gap-1.5 rounded-full px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
    >
      <span className="flex h-8 items-center gap-1.5 rounded-full border border-edge bg-surface2 px-3 font-thai text-sm text-ink transition-colors hover:bg-edge">
        <CurrencyImage size={24} className="-ml-1.5" />
        <span className="font-mono tabular-nums">{data.balance.toLocaleString('th-TH')}</span>
      </span>
    </Link>
  );
}

/** "กระเป๋าตัง" row in the header's mobile menu, balance right-aligned; same cache entry as the chip. Nothing while the wallet is off. */
export function WalletMenuRow({ className }: { className: string }) {
  const data = enabledWallet(useWallet().data);
  if (!data) return null;
  return (
    <Link href="/dashboard/wallet" className={className}>
      <CurrencyImage size={16} />
      {WALLET_NAME}
      <span className="ml-auto font-mono tabular-nums">{data.balance.toLocaleString('th-TH')}</span>
    </Link>
  );
}
