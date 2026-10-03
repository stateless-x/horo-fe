'use client';

import Link from 'next/link';
import { Button } from '@/lib-packages/ui';
import { compatibilityResultPath } from '@/features/compatibility/compatibility-routes';
import { useTicketHistory } from './use-wallet';
import { HISTORY_COPY } from './wallet-copy';

const date = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'Asia/Bangkok' });

export function TicketHistory() {
  const history = useTicketHistory();
  const entries = history.data?.pages.flatMap((page) => page.entries) ?? [];
  return (
    <div className="grid gap-3">
      {history.isPending && <p className="text-sm text-inkMuted">{HISTORY_COPY.loading}</p>}
      {history.isError && (
        <div className="rounded-xl border border-edge bg-surface p-4">
          <p>{HISTORY_COPY.failed}</p>
          <Button variant="soft" className="mt-3" onClick={() => history.refetch()}>{HISTORY_COPY.retry}</Button>
        </div>
      )}
      {history.isSuccess && (
        <>
          {entries.length === 0 ? (
            <p className="rounded-xl border border-edge bg-surface p-4 text-sm text-inkMuted">ยังไม่มีรายการตั๋ว</p>
          ) : (
            <ul className="divide-y divide-edge rounded-xl border border-edge bg-surface">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-base leading-snug text-ink">
                      {entry.kind === 'used' && entry.refId ? (
                        <Link href={compatibilityResultPath(entry.refId)} className="underline decoration-edge underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright">{entry.label}</Link>
                      ) : entry.label}
                    </p>
                    <p className="mt-0.5 text-sm text-inkMuted">
                      {date.format(new Date(entry.createdAt))}{entry.expiresAt && ` · หมดอายุ ${date.format(new Date(entry.expiresAt))}`}
                    </p>
                  </div>
                  <span className="shrink-0 font-heading font-semibold tabular-nums text-ink">{entry.kind === 'granted' || entry.kind === 'restored' ? '+' : '−'}{entry.units} ใบ</span>
                </li>
              ))}
            </ul>
          )}
          {history.hasNextPage && <Button type="button" variant="soft" onClick={() => history.fetchNextPage()} disabled={history.isFetchingNextPage} className="justify-self-center">{history.isFetchingNextPage ? HISTORY_COPY.loading : HISTORY_COPY.more}</Button>}
        </>
      )}
    </div>
  );
}
