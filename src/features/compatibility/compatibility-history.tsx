import { motion } from 'framer-motion';
import { Button } from '@/lib-packages/ui';
import { type RelationshipType, RELATIONSHIP_LABELS } from '@/lib-packages/shared';
import { Loader2, ChevronRight, Users, Stars } from 'lucide-react';
import {
  RELATIONSHIP_CONFIG,
  toThaiElement,
  type HistoryItem,
} from '@/features/compatibility/relationship-config';

interface CompatibilityHistoryProps {
  items: HistoryItem[];
  totalHistory: number;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onViewHistory: (id: string) => void;
}

export function CompatibilityHistory({
  items,
  totalHistory,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onViewHistory,
}: CompatibilityHistoryProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-heading text-ink flex items-center gap-2">
            <Stars className="w-5 h-5 text-accentBright" />
            ดวงที่เจ้าเคยส่อง
            {totalHistory > 0 && (
              <span className="text-xs md:text-sm text-inkMuted bg-surface px-2 py-0.5 rounded-full">
                {totalHistory} ครั้ง
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-inkMuted animate-spin" />
          </div>
        ) : items.length === 0 ? (
          // Empty state
          <div className="text-center py-8 space-y-3">
            <div className="flex justify-center gap-2 text-inkMuted/40">
              <Stars className="w-8 h-8" />
              <Users className="w-8 h-8" />
            </div>
            <p className="text-inkMuted text-base md:text-lg">ยังไม่มีประวัติการส่องดวง</p>
            <p className="text-inkMuted/60 text-sm md:text-base">ลองส่องดวงความสัมพันธ์กับคนรอบข้างเจ้าดูสิ</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => {
              const itemConfig = RELATIONSHIP_CONFIG[item.relationshipType as RelationshipType];
              if (!itemConfig) return null;
              const ItemIcon = itemConfig.icon;

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onViewHistory(item.id)}
                  className="w-full bg-surface/50 border border-surface2/30 rounded-xl p-4 hover:border-accent/30 transition-all text-left flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-full ${itemConfig.accentBg} flex items-center justify-center flex-shrink-0`}>
                    <ItemIcon className={`w-5 h-5 ${itemConfig.accent}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-ink font-medium truncate text-base md:text-lg">{item.partnerName}</p>
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <span className={itemConfig.accent}>{RELATIONSHIP_LABELS[item.relationshipType as RelationshipType]}</span>
                      {item.userElement && item.partnerElement && (
                        <>
                          <span className="text-inkMuted/40">&#x2022;</span>
                          <span className="text-inkMuted">{toThaiElement(item.userElement)} x {toThaiElement(item.partnerElement)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs md:text-sm text-inkMuted">
                      {formatRelativeDate(item.createdAt)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-inkMuted/50" />
                  </div>
                </motion.button>
              );
            })}

            {/* Load more */}
            {hasNextPage && (
              <Button
                variant="ghost"
                className="w-full text-inkMuted"
                onClick={onLoadMore}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                โหลดเพิ่ม
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
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
