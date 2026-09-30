import { useEffect, useRef } from 'react';
import { Button } from '@/lib-packages/ui';
import { type RelationshipType, RelationshipTypeSchema, RELATIONSHIP_LABELS } from '@/lib-packages/shared';
import { ArrowLeft } from 'lucide-react';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { CompatibilityReport } from '@/features/compatibility/compatibility-report';
import { useUserProfile } from '@/features/fortune/hooks/use-daily-fortune';
import { toThaiElement, type CompatibilityResult } from '@/features/compatibility/relationship-config';
import type { CompatibilitySharePlatform } from '@/lib-packages/shared';
import { trackMountedResultOnce } from './compatibility-result-tracking';

interface CompatibilityResultViewProps {
  result: CompatibilityResult;
  showShareSheet: boolean;
  onOpenShareSheet: () => void;
  onCloseShareSheet: () => void;
  onBackToForm: () => void;
  onShareInitiated: (platform: CompatibilitySharePlatform) => void;
  onResultOpen: () => void;
  /** A locked v4 report: writes the detail; resolves once the result holds the full report. */
  onUnlock: () => Promise<void>;
}

export function CompatibilityResultView({
  result,
  showShareSheet,
  onOpenShareSheet,
  onCloseShareSheet,
  onBackToForm,
  onShareInitiated,
  onResultOpen,
  onUnlock,
}: CompatibilityResultViewProps) {
  const parsedRelationshipType = RelationshipTypeSchema.safeParse(result.relationshipType);
  const resultOpenTracked = useRef(false);
  const { data: userProfile } = useUserProfile();
  const readerName = userProfile ? userProfile.user.displayName || userProfile.user.name : null;

  useEffect(() => {
    trackMountedResultOnce(resultOpenTracked, onResultOpen);
  }, [onResultOpen]);

  const shareSheet = (
    <ShareSheet
      surface="compatibility"
      isOpen={showShareSheet}
      onClose={onCloseShareSheet}
      compatibilityData={{
        url: result.shareToken ? `${SITE_URL}/compatibility/${result.shareToken}` : `${SITE_URL}/dashboard/compatibility`,
        partnerName: result.partnerName,
        relationshipLabel: RELATIONSHIP_LABELS[result.relationshipType as RelationshipType] || result.relationshipType,
        userElement: toThaiElement(result.userElement) || '',
        partnerElement: toThaiElement(result.partnerElement) || '',
      }}
      onShareInitiated={onShareInitiated}
    />
  );

  // The canon report page. It carries its own cover, pair and share card.
  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 pb-24 md:px-6">
      <div className={`mx-auto pb-2 pt-3 ${result.locked ? 'max-w-[1080px]' : 'max-w-[720px]'}`}>
        <Button variant="ghost" onClick={onBackToForm} className="-ml-3 min-h-11 gap-2 text-inkMuted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" />
          ดูดวงคู่อีกครั้ง
        </Button>
      </div>
      <CompatibilityReport
        reportId={result.id}
        score={result.score}
        content={result.structuredContent}
        relationshipType={parsedRelationshipType.success ? parsedRelationshipType.data : undefined}
        readerName={readerName}
        partnerName={result.partnerName}
        onUnlock={result.locked ? onUnlock : undefined}
        onShare={onOpenShareSheet}
        onNewCheck={onBackToForm}
      />
      {shareSheet}
    </div>
  );
}
