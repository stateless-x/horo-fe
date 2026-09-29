'use client';

import { useState } from 'react';
import { Button } from '@/lib-packages/ui';
import type { HistoryKind } from '@/lib-packages/shared/types/wallet';
import { LedgerList } from './ledger-list';
import { useWalletHistory } from './use-wallet';
import { HISTORY_COPY, HISTORY_FILTERS } from './wallet-copy';

/** The /dashboard/wallet ledger: kind pills, then pages of 20 with ดูเพิ่ม until the end. Render only while the wallet is on. */
export function WalletHistory() {
  const [kind, setKind] = useState<HistoryKind | undefined>(undefined);
  const history = useWalletHistory(kind);
  const entries = history.data?.pages.flatMap((page) => page.entries) ?? [];

  return (
    <div className="grid gap-3">
      <div role="group" aria-label="กรองรายการ" className="flex flex-wrap gap-2">
        {HISTORY_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            aria-pressed={kind === filter.kind}
            onClick={() => setKind(filter.kind)}
            className={`min-h-9 rounded-full border px-3 font-thai text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright ${
              kind === filter.kind ? 'border-ink bg-ink text-ground' : 'border-edge bg-surface text-inkMuted hover:text-ink'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {history.isPending && <p className="text-sm text-inkMuted">{HISTORY_COPY.loading}</p>}

      {history.isError && (
        <div className="rounded-xl border border-edge bg-surface px-4 py-5">
          <p className="text-ink">{HISTORY_COPY.failed}</p>
          <Button type="button" variant="soft" onClick={() => history.refetch()} className="mt-3">
            {HISTORY_COPY.retry}
          </Button>
        </div>
      )}

      {history.isSuccess && (
        <>
          <LedgerList entries={entries} />
          {history.hasNextPage ? (
            <Button
              type="button"
              variant="soft"
              onClick={() => history.fetchNextPage()}
              disabled={history.isFetchingNextPage}
              className="justify-self-center"
            >
              {history.isFetchingNextPage ? HISTORY_COPY.loading : HISTORY_COPY.more}
            </Button>
          ) : (
            entries.length > 0 && <p className="text-center text-sm text-inkMuted">{HISTORY_COPY.end}</p>
          )}
        </>
      )}
    </div>
  );
}
