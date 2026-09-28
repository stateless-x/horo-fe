import { RelationshipClayImage } from '@/features/compatibility/relationship-clay-image';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Button } from '@/lib-packages/ui';
import { type RelationshipType, RelationshipTypeSchema, RELATIONSHIP_LABELS } from '@/lib-packages/shared';
import { ArrowLeft, ArrowLeftRight, Share2, Stars } from 'lucide-react';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { CompatibilityReading } from '@/features/compatibility/compatibility-reading';
import { CompatibilityReport } from '@/features/compatibility/compatibility-report';
import { useUserProfile } from '@/features/fortune/hooks/use-daily-fortune';
import { ElementClayImage, type ClayElement } from '@/components/ui/element-clay-image';
import {
  RELATIONSHIP_CONFIG,
  toThaiElement,
  type CompatibilityResult,
  type RelationshipConfig,
} from '@/features/compatibility/relationship-config';
import type { CompatibilitySharePlatform } from '@/lib-packages/shared';
import { trackMountedResultOnce } from './compatibility-result-tracking';

interface CompatibilityResultViewProps {
  result: CompatibilityResult;
  fallbackConfig: RelationshipConfig;
  showShareSheet: boolean;
  onOpenShareSheet: () => void;
  onCloseShareSheet: () => void;
  onBackToForm: () => void;
  onGuidanceOpen: () => void;
  onShareInitiated: (platform: CompatibilitySharePlatform) => void;
  onResultOpen: () => void;
  /** A locked v4 report: writes the detail; resolves once the result holds the full report. */
  onUnlock: () => Promise<void>;
}

export function CompatibilityResultView({
  result,
  fallbackConfig,
  showShareSheet,
  onOpenShareSheet,
  onCloseShareSheet,
  onBackToForm,
  onGuidanceOpen,
  onShareInitiated,
  onResultOpen,
  onUnlock,
}: CompatibilityResultViewProps) {
  const resultConfig = RELATIONSHIP_CONFIG[result.relationshipType as RelationshipType] || fallbackConfig;
  const parsedRelationshipType = RelationshipTypeSchema.safeParse(result.relationshipType);
  const resultOpenTracked = useRef(false);
  const { data: userProfile } = useUserProfile();
  const isStructuredV2 = result.structuredContent?.contentVersion === 2;
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

  // Content v4: the report page. It carries its own cover, pair and share card.
  if (result.structuredContent?.contentVersion === 4) {
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

  // v1 and v2 rows always carry their text; a v4 row takes the branch above.
  const analysis = result.analysis;
  if (analysis === undefined) throw new Error(`Compatibility ${result.id} is not v4 and has no analysis`);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Button
            variant="ghost"
            onClick={onBackToForm}
            className="text-inkMuted hover:text-ink -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ดูดวงคู่อีกครั้ง
          </Button>

          {!isStructuredV2 && (
            <div className="space-y-3 text-center">
              <RelationshipClayImage relationshipType={result.relationshipType} className="mx-auto size-24" sizes="96px" />
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${resultConfig.accentBg} ${resultConfig.accentBorder} ${resultConfig.accent}`}>
                  {RELATIONSHIP_LABELS[result.relationshipType as RelationshipType]}
                </span>
              </div>

              <h1 className="font-heading text-3xl text-ink md:text-4xl">
                {resultConfig.resultTitle(result.partnerName)}
              </h1>

              {result.userElement && result.partnerElement && (
                <p className="text-sm text-inkMuted md:text-base">
                  ธาตุ{toThaiElement(result.userElement)} x ธาตุ{toThaiElement(result.partnerElement)}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Element visualization */}
        {!isStructuredV2 && result.userElement && result.partnerElement && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <section aria-labelledby="compatibility-elements-title" className="rounded-2xl border border-edge bg-surface px-5 py-6 shadow-[0_18px_50px_rgba(107,33,168,0.08)] md:px-7 md:py-7">
              <h2 id="compatibility-elements-title" className="flex items-center justify-center gap-2 font-heading text-lg font-semibold text-ink">
                <Stars className="size-5 text-accentBright" aria-hidden="true" />
                พลังธาตุของทั้งสองคน
              </h2>
              <div className="mt-5 flex items-center justify-center gap-5 sm:gap-8">
                <div className="min-w-24 text-center">
                  <ElementClayImage
                    element={result.userElement as ClayElement}
                    alt={`โมเดลดินปั้น ธาตุ${toThaiElement(result.userElement)}`}
                    sizes="80px"
                    className="mx-auto size-20"
                  />
                  <p className="mt-2 font-heading text-ink">คุณ</p>
                  <p className="mt-0.5 text-sm text-inkMuted">ธาตุ{toThaiElement(result.userElement)}</p>
                  {result.userDayMaster && <p className="mt-1 text-xs text-inkMuted">{result.userDayMaster}</p>}
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-pink-600 dark:text-pink-400"
                >
                  <ArrowLeftRight className="size-7" aria-hidden="true" />
                </motion.div>

                <div className="min-w-24 text-center">
                  <ElementClayImage
                    element={result.partnerElement as ClayElement}
                    alt={`โมเดลดินปั้น ธาตุ${toThaiElement(result.partnerElement)}`}
                    sizes="80px"
                    className="mx-auto size-20"
                  />
                  <p className="mt-2 font-heading text-ink">{result.partnerName}</p>
                  <p className="mt-0.5 text-sm text-inkMuted">ธาตุ{toThaiElement(result.partnerElement)}</p>
                  {result.partnerDayMaster && <p className="mt-1 text-xs text-inkMuted">{result.partnerDayMaster}</p>}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* Compatibility reading: v2 cards with legacy markdown fallback */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <CompatibilityReading
            score={result.score}
            analysis={analysis}
            structuredContent={result.structuredContent}
            relationshipType={parsedRelationshipType.success ? parsedRelationshipType.data : undefined}
            onGuidanceOpen={onGuidanceOpen}
            readerName={readerName}
            partnerName={result.partnerName}
            readerElement={result.userElement}
            readerDayMaster={result.userDayMaster}
            partnerElement={result.partnerElement}
            partnerDayMaster={result.partnerDayMaster}
            relationshipTitle={resultConfig.resultTitle(result.partnerName)}
            relationshipLabel={RELATIONSHIP_LABELS[result.relationshipType as RelationshipType] || result.relationshipType}
          />
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={onOpenShareSheet}
          >
            <Share2 className="w-5 h-5 mr-2" />
            {isStructuredV2 ? 'ส่งการ์ดคู่นี้' : 'แชร์ผลดวง'}
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={onBackToForm}>
            {isStructuredV2 ? 'ลองดูอีกความสัมพันธ์' : 'ดูดวงคู่อีกครั้ง'}
          </Button>
        </motion.div>

        {shareSheet}
      </div>
    </div>
  );
}
