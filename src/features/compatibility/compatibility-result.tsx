import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/lib-packages/ui';
import { type RelationshipType, RELATIONSHIP_LABELS } from '@/lib-packages/shared';
import { ArrowLeft, ArrowLeftRight, Share2, Stars } from 'lucide-react';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL } from '@/lib/share-utils';
import { CompatibilityReading } from '@/features/compatibility/compatibility-reading';
import {
  RELATIONSHIP_CONFIG,
  toThaiElement,
  type CompatibilityResult,
  type RelationshipConfig,
} from '@/features/compatibility/relationship-config';

interface CompatibilityResultViewProps {
  result: CompatibilityResult;
  fallbackConfig: RelationshipConfig;
  showShareSheet: boolean;
  onOpenShareSheet: () => void;
  onCloseShareSheet: () => void;
  onBackToForm: () => void;
}

export function CompatibilityResultView({
  result,
  fallbackConfig,
  showShareSheet,
  onOpenShareSheet,
  onCloseShareSheet,
  onBackToForm,
}: CompatibilityResultViewProps) {
  const resultConfig = RELATIONSHIP_CONFIG[result.relationshipType as RelationshipType] || fallbackConfig;
  const ResultIcon = resultConfig.icon;

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
            ส่องดวงอีกครั้ง
          </Button>

          <div className="text-center space-y-3">
            {/* Relationship type badge */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${resultConfig.accentBg} ${resultConfig.accentBorder} border ${resultConfig.accent}`}>
                <ResultIcon className="w-3.5 h-3.5" />
                {RELATIONSHIP_LABELS[result.relationshipType as RelationshipType]}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-heading text-ink">
              {resultConfig.resultTitle(result.partnerName)}
            </h1>

            {result.userElement && result.partnerElement && (
              <p className="text-inkMuted text-sm md:text-base">
                ธาตุ{toThaiElement(result.userElement)} x ธาตุ{toThaiElement(result.partnerElement)}
              </p>
            )}
          </div>
        </motion.div>

        {/* Element visualization */}
        {result.userElement && result.partnerElement && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-surface2 to-surface">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Stars className="w-6 h-6 text-accentBright" aria-hidden="true" />
                  <span>พลังธาตุของทั้งสองคน</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4 py-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-ink">{toThaiElement(result.userElement)}</span>
                    </div>
                    <p className="text-sm md:text-base text-ink">เจ้า</p>
                    {result.userDayMaster && <p className="text-xs md:text-sm text-inkMuted">{result.userDayMaster}</p>}
                  </div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="text-inkMuted"
                  >
                    <ArrowLeftRight className="w-8 h-8" aria-hidden="true" />
                  </motion.div>

                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-accentBright/20 border-2 border-accentBright flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-ink">{toThaiElement(result.partnerElement)}</span>
                    </div>
                    <p className="text-sm md:text-base text-ink">{result.partnerName}</p>
                    {result.partnerDayMaster && <p className="text-xs md:text-sm text-inkMuted">{result.partnerDayMaster}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Compatibility reading: v2 cards with legacy markdown fallback */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <CompatibilityReading
            score={result.score}
            analysis={result.analysis}
            structuredContent={result.structuredContent}
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
            แชร์ผลดวง
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={onBackToForm}>
            ส่องดวงอีกครั้ง
          </Button>
        </motion.div>

        {/* Share Sheet */}
        <ShareSheet
          isOpen={showShareSheet}
          onClose={onCloseShareSheet}
          compatibilityData={{
            url: result.shareToken ? `${SITE_URL}/compatibility/${result.shareToken}` : `${SITE_URL}/dashboard/compatibility`,
            partnerName: result.partnerName,
            relationshipLabel: RELATIONSHIP_LABELS[result.relationshipType as RelationshipType] || result.relationshipType,
            userElement: toThaiElement(result.userElement) || '',
            partnerElement: toThaiElement(result.partnerElement) || '',
          }}
        />
      </div>
    </div>
  );
}
