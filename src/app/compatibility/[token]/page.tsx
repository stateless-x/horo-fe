'use client';

import { RelationshipClayImage } from '@/features/compatibility/relationship-clay-image';
import { ElementClayImage, type ClayElement } from '@/components/ui/element-clay-image';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/lib-packages/ui';
import { RELATIONSHIP_LABELS, RelationshipTypeSchema, type RelationshipType } from '@/lib-packages/shared';
import type { CompatibilityStructuredContent } from '@/lib-packages/shared/types/reading';
import {
  Sparkles, Stars, ArrowLeftRight,
} from 'lucide-react';
import { ClayOracleLoader } from '@/components/ui/clay-oracle-loader';
import { CompatibilityReading } from '@/features/compatibility/compatibility-reading';


const ELEMENT_NAMES_THAI: Record<string, string> = {
  wood: 'ไม้',
  fire: 'ไฟ',
  earth: 'ดิน',
  metal: 'ทอง',
  water: 'น้ำ',
};

function toThaiElement(element: string | null | undefined): string {
  if (!element) return '';
  return ELEMENT_NAMES_THAI[element.toLowerCase()] || element;
}

const RELATIONSHIP_ACCENTS: Record<string, { accent: string; accentBg: string; accentBorder: string }> = {
  romantic: { accent: 'text-pink-600 dark:text-pink-400', accentBg: 'bg-pink-500/15', accentBorder: 'border-pink-400/50' },
  talking: { accent: 'text-pink-600 dark:text-pink-400', accentBg: 'bg-pink-500/15', accentBorder: 'border-pink-400/50' },
  boss: { accent: 'text-accentBright', accentBg: 'bg-accent/15', accentBorder: 'border-accentBright/50' },
  coworker: { accent: 'text-accentBright', accentBg: 'bg-accent/15', accentBorder: 'border-accentBright/50' },
  friend: { accent: 'text-accentBright', accentBg: 'bg-accent/15', accentBorder: 'border-accentBright/50' },
  family: { accent: 'text-accentBright', accentBg: 'bg-accent/15', accentBorder: 'border-accentBright/50' },
};

interface SharedResult {
  partnerName: string;
  relationshipType: string;
  score: number;
  analysis: string;
  contentVersion?: number;
  structuredContent?: CompatibilityStructuredContent | null;
  strengths: string[];
  challenges: string[];
  userElement: string | null;
  partnerElement: string | null;
  userDayMaster: string | null;
  partnerDayMaster: string | null;
  createdAt: string;
}

export default function CompatibilitySharePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [result, setResult] = useState<SharedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSharedResult() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/fortune/compatibility/share/${token}`
        );

        if (!response.ok) {
          setError('ไม่พบผลดวงที่ต้องการ');
          return;
        }

        const data = await response.json();
        setResult(data);
      } catch {
        setError('ตอนนี้โหลดข้อมูลไม่ได้ ลองอีกครั้งนะ');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchSharedResult();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <div className="relative flex min-h-64 items-center justify-center">
          <div className="absolute inset-1/4 rounded-full bg-accentBright/15 blur-3xl" aria-hidden="true" />
          <ClayOracleLoader alt="กำลังเปิดผลดวงความสัมพันธ์" />
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <Sparkles className="w-12 h-12 text-inkMuted mx-auto" />
          <h1 className="text-2xl font-heading text-ink">{error || 'ไม่พบผลดวง'}</h1>
          <p className="text-inkMuted">ลิงก์อาจหมดอายุหรือไม่ถูกต้อง</p>
          <Button onClick={() => router.push('/dashboard/compatibility')} className="w-full max-w-xs mx-auto">
            ลองดูดวงของคุณ
          </Button>
        </div>
      </div>
    );
  }

  const accents = RELATIONSHIP_ACCENTS[result.relationshipType] || RELATIONSHIP_ACCENTS.romantic;
  const label = RELATIONSHIP_LABELS[result.relationshipType as RelationshipType] || result.relationshipType;
  const parsedRelationshipType = RelationshipTypeSchema.safeParse(result.relationshipType);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
<RelationshipClayImage relationshipType={result.relationshipType} className="mx-auto size-24" sizes="96px" />
          {/* Relationship type label */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${accents.accentBg} ${accents.accentBorder} border ${accents.accent}`}>
              {label}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-heading text-ink">
            ดวง{label}กับ {result.partnerName}
          </h1>

          {result.userElement && result.partnerElement && (
            <p className="text-inkMuted text-sm">
              ธาตุ{toThaiElement(result.userElement)} x ธาตุ{toThaiElement(result.partnerElement)}
            </p>
          )}
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
                    <ElementClayImage element={result.userElement as ClayElement} alt={`ธาตุ${toThaiElement(result.userElement)}`} sizes="80px" className="mx-auto mb-2 size-20" />
                    <p className="text-sm text-ink">เจ้าของดวง</p>
                    {result.userDayMaster && <p className="text-xs text-inkMuted">{result.userDayMaster}</p>}
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
                    <ElementClayImage element={result.partnerElement as ClayElement} alt={`ธาตุ${toThaiElement(result.partnerElement)}`} sizes="80px" className="mx-auto mb-2 size-20" />
                    <p className="text-sm text-ink">{result.partnerName}</p>
                    {result.partnerDayMaster && <p className="text-xs text-inkMuted">{result.partnerDayMaster}</p>}
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
            relationshipType={parsedRelationshipType.success ? parsedRelationshipType.data : undefined}
          />
        </motion.div>

        {/* CTA: Try it yourself */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-accent/20 to-accentBright/10 border-accent/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Sparkles className="w-8 h-8 text-accentBright mx-auto" />
                <h3 className="text-lg font-heading text-ink">แล้วคุณกับคนในใจ เข้ากันแค่ไหน</h3>
                <p className="text-inkMuted text-sm">ลองดูดวงคู่ฟรี มีทั้งคนคุย คนรัก เพื่อน และครอบครัว</p>
                <Button
                  size="lg"
                  className="w-full max-w-xs mx-auto"
                  onClick={() => router.push('/dashboard/compatibility')}
                >
                  ลองดูดวงของคุณ
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-inkMuted/60 text-xs">
            <Link href="/" className="hover:text-inkMuted transition-colors">สายมู.com</Link> ดูดวงออนไลน์ฟรี ด้วย AI
          </p>
        </div>
      </div>
    </div>
  );
}
