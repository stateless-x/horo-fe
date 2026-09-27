'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useWallet } from './use-wallet';
import { UNIT } from './wallet-copy';

/** "ละอองดาว 49" in the app header, linking to /dashboard/wallet. Nothing until the balance is known. */
export function BalanceChip() {
  const { data } = useWallet();
  if (!data) return null;
  return (
    <Link
      href="/dashboard/wallet"
      aria-label={`${UNIT} ${data.balance} เปิดกระเป๋า${UNIT}`}
      className="flex h-11 items-center gap-1.5 rounded-full px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
    >
      <span className="flex h-8 items-center gap-1.5 rounded-full border border-edge bg-surface2 px-3 font-thai text-sm text-ink transition-colors hover:bg-edge">
        <Sparkles className="size-3.5 text-inkMuted" aria-hidden="true" />
        {UNIT}
        <span className="font-mono tabular-nums">{data.balance.toLocaleString('th-TH')}</span>
      </span>
    </Link>
  );
}
