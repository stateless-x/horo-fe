'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, Button } from '@/lib-packages/ui';
import { RELATIONSHIP_LABELS, RelationshipTypeSchema } from '@/lib-packages/shared';
import { Sparkles } from 'lucide-react';
import { MainLoader } from '@/components/ui/main-loader';
import { ReportCover } from '@/features/compatibility/report/report-cover';
import { DimensionBars } from '@/features/compatibility/report/dimension-bars';
import type { CompatibilityV4Share } from '@/lib-packages/shared/types/compatibility';


/** GET /api/fortune/compatibility/share/:token: the free fields of a current report. Legacy rows answer 404. */
interface SharedResult {
  partnerName: string;
  relationshipType: string;
  score: number;
  contentVersion: 4;
  structuredContent: CompatibilityV4Share;
  userElement: string | null;
  partnerElement: string | null;
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
        <MainLoader label="กำลังเปิดผลดวงความสัมพันธ์" />
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

  const tryYours = (
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
  );

  // The free cover and the score numbers, the same components as the report page.
  const shared = result.structuredContent;
  const relationship = RelationshipTypeSchema.safeParse(result.relationshipType);
  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[680px] space-y-14">
        <ReportCover
          content={{ archetype: shared.archetype, people: shared.people, verdict: shared.verdict }}
          score={result.score}
          readerName="เจ้าของดวง"
          partnerName={result.partnerName}
          relationshipLabel={relationship.success ? `ดวง${RELATIONSHIP_LABELS[relationship.data]}` : 'ดวงคู่'}
          full={false}
        />
        <DimensionBars dimensions={shared.dimensions} hideLockNote />
        {tryYours}
        <p className="text-center text-xs text-inkMuted/60">
          <Link href="/" className="hover:text-inkMuted transition-colors">สายมู.com</Link> ดูดวงออนไลน์ฟรี ด้วย AI
        </p>
      </div>
    </div>
  );
}
