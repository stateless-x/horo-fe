'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/lib-packages/ui';
import { RELATIONSHIP_LABELS, type RelationshipType } from '@/lib-packages/shared';
import {
  Loader2, Heart, MessageCircleHeart, Crown, Users, Laugh, Home, Sparkles,
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

// Relationship type icon mapping (reuse from dashboard page)
const RELATIONSHIP_ICONS: Record<string, typeof Heart> = {
  romantic: Heart,
  talking: MessageCircleHeart,
  boss: Crown,
  coworker: Users,
  friend: Laugh,
  family: Home,
};

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
  romantic: { accent: 'text-red-400', accentBg: 'bg-red-500/15', accentBorder: 'border-red-400/50' },
  talking: { accent: 'text-pink-400', accentBg: 'bg-pink-500/15', accentBorder: 'border-pink-400/50' },
  boss: { accent: 'text-amber-400', accentBg: 'bg-amber-500/15', accentBorder: 'border-amber-400/50' },
  coworker: { accent: 'text-blue-400', accentBg: 'bg-blue-500/15', accentBorder: 'border-blue-400/50' },
  friend: { accent: 'text-green-400', accentBg: 'bg-green-500/15', accentBorder: 'border-green-400/50' },
  family: { accent: 'text-purple-400', accentBg: 'bg-purple-500/15', accentBorder: 'border-purple-400/50' },
};

interface SharedResult {
  partnerName: string;
  relationshipType: string;
  score: number;
  analysis: string;
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
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
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
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 border-4 border-royalPurple border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <Sparkles className="w-12 h-12 text-ashGray mx-auto" />
          <h1 className="text-2xl font-heading text-ghostWhite">{error || 'ไม่พบผลดวง'}</h1>
          <p className="text-ashGray">ลิงก์อาจหมดอายุหรือไม่ถูกต้อง</p>
          <Button onClick={() => router.push('/dashboard/compatibility')} className="w-full max-w-xs mx-auto">
            ส่องดวงของเจ้าเลย
          </Button>
        </div>
      </div>
    );
  }

  const Icon = RELATIONSHIP_ICONS[result.relationshipType] || Heart;
  const accents = RELATIONSHIP_ACCENTS[result.relationshipType] || RELATIONSHIP_ACCENTS.romantic;
  const label = RELATIONSHIP_LABELS[result.relationshipType as RelationshipType] || result.relationshipType;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          {/* Relationship type badge */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${accents.accentBg} ${accents.accentBorder} border ${accents.accent}`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-heading text-ghostWhite">
            ดวง{label}กับ {result.partnerName}
          </h1>

          {result.userElement && result.partnerElement && (
            <p className="text-ashGray text-sm">
              ธาตุ{toThaiElement(result.userElement)} x ธาตุ{toThaiElement(result.partnerElement)}
            </p>
          )}
        </motion.div>

        {/* Element visualization */}
        {result.userElement && result.partnerElement && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-darkPurple to-deepNight">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <span className="text-2xl">&#x1F31F;</span>
                  <span>พลังธาตุของทั้งสองคน</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4 py-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-royalPurple/20 border-2 border-royalPurple flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-ghostWhite">{toThaiElement(result.userElement)}</span>
                    </div>
                    <p className="text-sm text-ghostWhite">เพื่อนของเจ้า</p>
                    {result.userDayMaster && <p className="text-xs text-ashGray">{result.userDayMaster}</p>}
                  </div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="text-4xl text-ashGray"
                  >
                    &#x27F7;
                  </motion.div>

                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-amethyst/20 border-2 border-amethyst flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-ghostWhite">{toThaiElement(result.partnerElement)}</span>
                    </div>
                    <p className="text-sm text-ghostWhite">{result.partnerName}</p>
                    {result.partnerDayMaster && <p className="text-xs text-ashGray">{result.partnerDayMaster}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* LLM Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <span className="text-xl">&#x2728;</span>
                <span>คำวิเคราะห์จากดวงดาว</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={result.analysis} />
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA: Try it yourself */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-royalPurple/20 to-amethyst/10 border-royalPurple/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Sparkles className="w-8 h-8 text-amethyst mx-auto" />
                <h3 className="text-lg font-heading text-ghostWhite">อยากรู้ดวงความสัมพันธ์ของเจ้าบ้างไหม?</h3>
                <p className="text-ashGray text-sm">ส่องดวงกับคนรอบข้างของเจ้าได้ฟรี! วิเคราะห์ด้วย AI ผสานโหราศาสตร์</p>
                <Button
                  size="lg"
                  className="w-full max-w-xs mx-auto"
                  onClick={() => router.push('/dashboard/compatibility')}
                >
                  ส่องดวงของเจ้าเลย
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-ashGray/60 text-xs">
            <a href="/" className="hover:text-ashGray transition-colors">สายมู.com</a> — ดูดวงออนไลน์ฟรี ด้วย AI
          </p>
        </div>
      </div>
    </div>
  );
}
