import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RelationshipClayImage } from '@/features/compatibility/relationship-clay-image';
import { motion } from 'framer-motion';
import { Button, buttonVariants, cn } from '@/lib-packages/ui';
import { type RelationshipType, RELATIONSHIP_LABELS } from '@/lib-packages/shared';
import { Loader2, ChevronRight, Stars, LockKeyhole } from 'lucide-react';
import {
  RELATIONSHIP_CONFIG,
  type HistoryItem,
} from '@/features/compatibility/relationship-config';

interface CompatibilityHistoryProps {
  items: HistoryItem[];
  totalHistory: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onViewHistory: (id: string) => void;
  /** Where the full list lives; linked from the header when `totalHistory` is more than `items` shows. */
  seeAllHref: string;
}

/** The dashboard's history section: the newest checks, with a link to the full list when there are more. */
export function CompatibilityHistory({
  items,
  totalHistory,
  isLoading,
  isError,
  onRetry,
  onViewHistory,
  seeAllHref,
}: CompatibilityHistoryProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg md:text-xl font-heading text-ink flex items-center gap-2">
            <Stars className="w-5 h-5 text-accentBright" />
            ดวงคู่ที่เคยดู
            {totalHistory > 0 && (
              <span className="text-xs md:text-sm text-inkMuted bg-surface px-2 py-0.5 rounded-full">
                {totalHistory} ครั้ง
              </span>
            )}
          </h2>
          {totalHistory > items.length && (
            <Link
              href={seeAllHref}
              className={cn(buttonVariants({ variant: 'ghost' }), '-mr-3 gap-1 px-3 text-accentBright')}
            >
              ดูทั้งหมด
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <HistorySpinner />
        ) : isError ? (
          <CompatibilityHistoryError onRetry={onRetry} />
        ) : items.length === 0 ? (
          <CompatibilityHistoryEmpty />
        ) : (
          <CompatibilityHistoryList items={items} onViewHistory={onViewHistory} />
        )}
      </div>
    </motion.div>
  );
}

/** Rows of past checks; every history surface renders them through here. */
export function CompatibilityHistoryList({
  items,
  onViewHistory,
}: {
  items: HistoryItem[];
  onViewHistory: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <CompatibilityHistoryRow key={item.id} item={item} index={index} onViewHistory={onViewHistory} />
      ))}
    </div>
  );
}

function CompatibilityHistoryRow({
  item,
  index,
  onViewHistory,
}: {
  item: HistoryItem;
  index: number;
  onViewHistory: (id: string) => void;
}) {
  const itemConfig = RELATIONSHIP_CONFIG[item.relationshipType as RelationshipType];
  if (!itemConfig) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      // Capped so the last row of a 20-row page does not wait a full second.
      transition={{ delay: Math.min(index, 6) * 0.05 }}
      onClick={() => onViewHistory(item.id)}
      className="group w-full bg-surface/50 border border-edge rounded-2xl p-4 hover:border-accent/30 hover:bg-surface transition-colors text-left flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentBright focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <RelationshipClayImage relationshipType={item.relationshipType} className="size-16" sizes="64px" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="min-w-0 break-words text-base font-semibold text-ink md:text-lg">{item.partnerName}</p>
          {item.locked === false && <span className="sr-only">อ่านฉบับเต็มได้</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm">
          <span className={itemConfig.accent}>{RELATIONSHIP_LABELS[item.relationshipType as RelationshipType]}</span>
          <span className="text-inkMuted/40" aria-hidden="true">·</span>
          <span className="text-inkMuted">{formatRelativeDate(item.createdAt)}</span>
          </div>
        </div>
      </div>
      {item.locked === true ? (
        <span className="shrink-0 text-inkMuted" title="ยังไม่เปิดฉบับเต็ม">
          <LockKeyhole className="size-4" aria-hidden="true" />
          <span className="sr-only">ยังไม่เปิดฉบับเต็ม</span>
        </span>
      ) : (
        <ChevronRight className="size-4 shrink-0 text-inkMuted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      )}
    </motion.button>
  );
}

export function HistorySpinner() {
  return (
    <div className="flex justify-center py-8">
      {/* Stays a plain spinner, not MainLoader: this is a fast paginated
          fetch, and the mascot holds each pose for 500ms — a sub-second
          load would show one arbitrary pose (sleeping, "LOADING...",
          a Saturn flourish) that differs on every refresh. */}
      <Loader2 className="w-6 h-6 text-inkMuted animate-spin" aria-label="กำลังโหลด" />
    </div>
  );
}

/** No checks yet. `children` adds an action under the invitation. */
export function CompatibilityHistoryEmpty({ children }: { children?: ReactNode }) {
  return (
    <div className="text-center py-8 space-y-3">
      <Image src="/assets/clay/little-oracle-mark-v1.webp" alt="" width={480} height={480} sizes="80px" className="mx-auto size-20 object-contain" />
      <p className="text-inkMuted text-base md:text-lg">ดวงคู่ครั้งแรก เริ่มที่ใครดี</p>
      <p className="text-inkMuted/60 text-sm md:text-base">ลองดูดวงคู่กับคนที่อยากรู้จักให้มากขึ้น</p>
      {children}
    </div>
  );
}

export function CompatibilityHistoryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-edge bg-surface px-4 py-5">
      <p className="text-ink">โหลดดวงคู่ที่เคยดูไม่สำเร็จ</p>
      <Button type="button" variant="soft" onClick={onRetry} className="mt-3">
        ลองอีกครั้ง
      </Button>
    </div>
  );
}

// --- Helpers ---

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชม.ที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;

  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}
