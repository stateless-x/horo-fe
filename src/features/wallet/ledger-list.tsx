import Link from 'next/link';
import { compatibilityResultPath } from '@/features/compatibility/compatibility-routes';
import type { LedgerEntry } from '@/lib-packages/shared/types/wallet';
import { entryLabel, signed } from './wallet-copy';

const DATE = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'Asia/Bangkok' });

/** The newest ledger rows: what each was for (a ดวงคู่ unlock links to its reading), when, and the signed amount. */
export function LedgerList({ entries }: { entries: LedgerEntry[] }) {
  if (entries.length === 0) {
    return <p className="rounded-xl border border-edge bg-surface px-4 py-5 text-sm text-inkMuted">ยังไม่มีรายการ</p>;
  }
  return (
    <ul className="divide-y divide-edge rounded-xl border border-edge bg-surface">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[0.9375rem] leading-snug text-ink">
              {entry.refName && entry.refId ? (
                <Link
                  href={compatibilityResultPath(entry.refId)}
                  className="underline decoration-edge underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright"
                >
                  {entryLabel(entry)}
                </Link>
              ) : (
                entryLabel(entry)
              )}
            </p>
            <p className="mt-0.5 text-[0.8125rem] text-inkMuted">
              {DATE.format(new Date(entry.createdAt))}
              {entry.expiresAt && ` · ใช้ได้ถึง ${DATE.format(new Date(entry.expiresAt))}`}
              {entry.by === 'team' && entry.kind !== 'admin_adjust' && ' · โดยทีมงาน'}
            </p>
          </div>
          <span className={`shrink-0 font-mono text-base tabular-nums ${entry.delta > 0 ? 'text-success' : 'text-ink'}`}>
            {signed(entry.delta)}
          </span>
        </li>
      ))}
    </ul>
  );
}
