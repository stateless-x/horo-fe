import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants, cn } from '@/lib-packages/ui';
import { RELATIONSHIP_LABELS, RELATIONSHIP_TYPES, type RelationshipType } from '@/lib-packages/shared';
import type { HistoryItem } from '@/features/compatibility/relationship-config';
import {
  CompatibilityHistoryEmpty,
  CompatibilityHistoryError,
  CompatibilityHistoryList,
  HistorySpinner,
} from '@/features/compatibility/compatibility-history';
import {
  COMPATIBILITY_DASHBOARD_PATH,
  compatibilityHistoryPath,
} from '@/features/compatibility/compatibility-routes';

export type HistoryPageStatus = 'loading' | 'error' | 'ready';

interface CompatibilityHistoryPageViewProps {
  type?: RelationshipType;
  status: HistoryPageStatus;
  /** Checks matching the filter, from the first page; 0 until it loads. */
  total: number;
  /** The rows of the current page; read only when `status` is `ready`. */
  items: HistoryItem[];
  page: number;
  pageCount: number;
  onRetry: () => void;
  onViewHistory: (id: string) => void;
}

const FILTERS: { type?: RelationshipType; label: string }[] = [
  { label: 'ทั้งหมด' },
  ...RELATIONSHIP_TYPES.map((type) => ({ type, label: RELATIONSHIP_LABELS[type] })),
];

/** /dashboard/compatibility/history: every past check, one page at a time, optionally one relationship type. */
export function CompatibilityHistoryPageView({
  type,
  status,
  total,
  items,
  page,
  pageCount,
  onRetry,
  onViewHistory,
}: CompatibilityHistoryPageViewProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 pb-16 md:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="pb-2 pt-3">
          <Link
            href={COMPATIBILITY_DASHBOARD_PATH}
            className={cn(buttonVariants({ variant: 'ghost' }), '-ml-3 gap-2 px-3 text-inkMuted hover:text-ink')}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            ดูดวงคู่คนใหม่
          </Link>
        </div>

        <header className="mt-2">
          <h1 className="font-heading text-3xl font-semibold text-ink">ดวงคู่ที่เคยดู</h1>
          <p className="mt-1 min-h-6 text-sm text-inkMuted">
            {status === 'ready' && total > 0 && (type ? `${RELATIONSHIP_LABELS[type]} ${total} ครั้ง` : `ทั้งหมด ${total} ครั้ง`)}
          </p>
        </header>

        <nav aria-label="เลือกประเภทความสัมพันธ์" className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const active = filter.type === type;
            return (
              <Link
                key={filter.label}
                href={compatibilityHistoryPath({ type: filter.type })}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright',
                  active
                    ? 'border-transparent bg-accent/15 font-medium text-accentBright'
                    : 'border-edge text-inkMuted hover:bg-edgeSoft hover:text-ink',
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        <section aria-label={`หน้า ${page}`} className="mt-6">
          {status === 'loading' ? (
            <HistorySpinner />
          ) : status === 'error' ? (
            <CompatibilityHistoryError onRetry={onRetry} />
          ) : items.length === 0 ? (
            type ? (
              <p className="rounded-xl border border-edge bg-surface px-4 py-5 text-inkMuted">
                ยังไม่เคยดูดวงคู่แบบ{RELATIONSHIP_LABELS[type]}
              </p>
            ) : (
              <CompatibilityHistoryEmpty>
                <Link href={COMPATIBILITY_DASHBOARD_PATH} className={cn(buttonVariants(), 'mt-2')}>
                  เริ่มดูดวงคู่
                </Link>
              </CompatibilityHistoryEmpty>
            )
          ) : (
            <CompatibilityHistoryList items={items} onViewHistory={onViewHistory} />
          )}
        </section>

        {pageCount > 1 && (
          <nav aria-label="เปลี่ยนหน้า" className="mt-6 flex items-center justify-between gap-3">
            <PageLink href={page > 1 ? compatibilityHistoryPath({ page: page - 1, type }) : undefined}>
              <ChevronLeft className="size-4" aria-hidden="true" />
              ก่อนหน้า
            </PageLink>
            <p className="font-mono text-sm tabular-nums text-inkMuted">
              หน้า {page} / {pageCount}
            </p>
            <PageLink href={page < pageCount ? compatibilityHistoryPath({ page: page + 1, type }) : undefined}>
              ถัดไป
              <ChevronRight className="size-4" aria-hidden="true" />
            </PageLink>
          </nav>
        )}
      </div>
    </div>
  );
}

/** A pager step; with no `href` it is the disabled end of the range. */
function PageLink({ href, children }: { href?: string; children: ReactNode }) {
  const className = cn(buttonVariants({ variant: 'soft' }), 'gap-1 px-4');
  if (!href) {
    return (
      <span aria-disabled="true" className={cn(className, 'pointer-events-none opacity-50')}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
