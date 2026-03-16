'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/lib-packages/ui';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { THAI_MONTHS, BE_OFFSET, createUTCDateFromBE, type RelationshipType, RELATIONSHIP_TYPES, RELATIONSHIP_LABELS } from '@/lib-packages/shared';
import { useInfiniteQuery, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Loader2, ArrowLeft, ChevronRight, Share2,
  Heart, MessageCircleHeart, Crown, Users, Laugh, Home, Moon, Stars,
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { ShareSheet } from '@/components/share/share-sheet';
import { SITE_URL, type CompatibilityShareData } from '@/lib/share-utils';
import { PawjaiAdsBanner } from '@/components/ads/pawjai-ads-banner';

// --- Constants ---

const RELATIONSHIP_CONFIG: Record<RelationshipType, {
  icon: typeof Heart;
  accent: string;
  accentBg: string;
  accentBorder: string;
  cardTitle: string;
  placeholder: string;
  cta: string;
  resultTitle: (name: string) => string;
  loadingSteps: string[];
}> = {
  talking: {
    icon: MessageCircleHeart,
    accent: 'text-pink-400',
    accentBg: 'bg-pink-500/15',
    accentBorder: 'border-pink-400/50',
    cardTitle: 'กรอกข้อมูลคนที่เจ้าคุยอยู่',
    placeholder: 'ชื่อคนที่เจ้าคุยอยู่',
    cta: 'ส่องดวงคนคุย',
    resultTitle: (name: string) => `ดวงระหว่างเจ้ากับ ${name}`,
    loadingSteps: ['วิเคราะห์ไวบ์ระหว่างสองคน...', 'อ่านสัญญาณดวงดาว...', 'ประมวลผลความสัมพันธ์...'],
  },
  romantic: {
    icon: Heart,
    accent: 'text-red-400',
    accentBg: 'bg-red-500/15',
    accentBorder: 'border-red-400/50',
    cardTitle: 'กรอกข้อมูลคนรักของเจ้า',
    placeholder: 'ชื่อคนรักของเจ้า',
    cta: 'ส่องดวงคู่รัก',
    resultTitle: (name: string) => `ดวงรักระหว่างเจ้ากับ ${name}`,
    loadingSteps: ['วิเคราะห์ธาตุของทั้งสองคน...', 'เปรียบเทียบดาวประจำวัน...', 'ประมวลผลความสัมพันธ์...'],
  },
  boss: {
    icon: Crown,
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/15',
    accentBorder: 'border-amber-400/50',
    cardTitle: 'กรอกข้อมูลหัวหน้าของเจ้า',
    placeholder: 'ชื่อหัวหน้าของเจ้า',
    cta: 'ส่องดวงหัวหน้า',
    resultTitle: (name: string) => `ดวงการงานกับ ${name}`,
    loadingSteps: ['วิเคราะห์สไตล์การทำงาน...', 'เปรียบเทียบพลังงานการงาน...', 'ประมวลผลความสัมพันธ์...'],
  },
  coworker: {
    icon: Users,
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/15',
    accentBorder: 'border-blue-400/50',
    cardTitle: 'กรอกข้อมูลเพื่อนร่วมงาน',
    placeholder: 'ชื่อเพื่อนร่วมงาน',
    cta: 'ส่องดวงเพื่อนร่วมงาน',
    resultTitle: (name: string) => `ดวงการงานกับ ${name}`,
    loadingSteps: ['วิเคราะห์สไตล์การทำงาน...', 'เปรียบเทียบจุดแข็งของทีม...', 'ประมวลผลความสัมพันธ์...'],
  },
  friend: {
    icon: Laugh,
    accent: 'text-green-400',
    accentBg: 'bg-green-500/15',
    accentBorder: 'border-green-400/50',
    cardTitle: 'กรอกข้อมูลเพื่อนของเจ้า',
    placeholder: 'ชื่อเพื่อนของเจ้า',
    cta: 'ส่องดวงเพื่อน',
    resultTitle: (name: string) => `ดวงมิตรภาพกับ ${name}`,
    loadingSteps: ['วิเคราะห์พลังงานมิตรภาพ...', 'เปรียบเทียบธาตุของสองคน...', 'ประมวลผลความสัมพันธ์...'],
  },
  family: {
    icon: Home,
    accent: 'text-purple-400',
    accentBg: 'bg-purple-500/15',
    accentBorder: 'border-purple-400/50',
    cardTitle: 'กรอกข้อมูลสมาชิกในครอบครัว',
    placeholder: 'ชื่อคนในครอบครัว',
    cta: 'ส่องดวงครอบครัว',
    resultTitle: (name: string) => `ดวงครอบครัวกับ ${name}`,
    loadingSteps: ['วิเคราะห์สายสัมพันธ์ครอบครัว...', 'เปรียบเทียบธาตุของสองคน...', 'ประมวลผลความสัมพันธ์...'],
  },
};

// --- Types ---

interface CompatibilityResult {
  id: string;
  profileAId: string;
  partnerName: string;
  partnerBirthDate: string;
  relationshipType: string;
  score: number;
  analysis: string;
  strengths?: string[];
  challenges?: string[];
  userElement?: string;
  userDayMaster?: string;
  partnerElement?: string;
  partnerDayMaster?: string;
  shareToken?: string;
  cached?: boolean;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  partnerName: string;
  partnerBirthDate: string;
  relationshipType: string;
  score: number;
  userElement?: string;
  partnerElement?: string;
  createdAt: string;
}

interface HistoryResponse {
  data: HistoryItem[];
  nextCursor: string | null;
  total: number;
}

// --- Element Translation ---

const ELEMENT_NAMES_THAI: Record<string, string> = {
  wood: 'ไม้',
  fire: 'ไฟ',
  earth: 'ดิน',
  metal: 'ทอง',
  water: 'น้ำ',
};

function toThaiElement(element: string | undefined): string {
  if (!element) return '';
  return ELEMENT_NAMES_THAI[element.toLowerCase()] || element;
}

// --- Page ---

export default function CompatibilityPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [partnerName, setPartnerName] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('talking');
  const [day, setDay] = useState('1');
  const [month, setMonth] = useState('1');
  const currentYear = new Date().getFullYear() + BE_OFFSET;
  const [year, setYear] = useState((currentYear - 25).toString());

  // Calculation state
  const [calculating, setCalculating] = useState(false);
  const [calculationStep, setCalculationStep] = useState('');
  const [error, setError] = useState('');

  // Result state
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);

  // Share state
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Rate limit state
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    resetAt: string;
    retryAfter: number;
  } | null>(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  const config = RELATIONSHIP_CONFIG[relationshipType];

  // Redirect unauthenticated users
  useEffect(() => {
    if (!session && !sessionLoading) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  // Rate limit countdown timer
  useEffect(() => {
    if (rateLimitCountdown <= 0) return;
    const timer = setInterval(() => {
      setRateLimitCountdown(prev => {
        if (prev <= 1) {
          setRateLimitInfo(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitCountdown]);

  // History query
  const historyQuery = useInfiniteQuery<HistoryResponse>({
    queryKey: ['compatibility', 'history'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20' });
      if (pageParam) params.set('cursor', pageParam as string);
      return api.get<HistoryResponse>(`/api/fortune/compatibility/history?${params}`);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!session,
    staleTime: 60_000,
  });

  // Fetch a single history item by ID
  const historyDetailQuery = useQuery<CompatibilityResult>({
    queryKey: ['compatibility', viewingHistoryId],
    queryFn: () => api.get<CompatibilityResult>(`/api/fortune/compatibility/${viewingHistoryId}`),
    enabled: !!viewingHistoryId,
    staleTime: Infinity,
  });

  // When viewing a history detail, set the result
  useEffect(() => {
    if (historyDetailQuery.data) {
      setResult(historyDetailQuery.data);
    }
  }, [historyDetailQuery.data]);

  const handleCalculate = useCallback(async () => {
    if (!partnerName.trim()) {
      setError('กรุณากรอกชื่อ');
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    setCalculating(true);
    setError('');
    setResult(null);
    setViewingHistoryId(null);

    try {
      const steps = config.loadingSteps;
      for (let i = 0; i < steps.length - 1; i++) {
        setCalculationStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setCalculationStep(steps[steps.length - 1]);

      const birthDate = createUTCDateFromBE(dayNum, monthNum, yearNum);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fortune/compatibility`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: partnerName.trim(),
          partnerBirthDate: birthDate.toISOString(),
          relationshipType,
        }),
      });

      // Read rate limit headers
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '5');
      const resetAt = response.headers.get('X-RateLimit-Reset') || '';
      setRateLimitInfo({ remaining, resetAt, retryAfter: 0 });

      if (response.status === 429) {
        const data = await response.json();
        const retryAfter = data.retryAfter || 3600;
        setRateLimitInfo({ remaining: 0, resetAt, retryAfter });
        setRateLimitCountdown(retryAfter);
        setError(data.error || 'พลังดวงดาวต้องการเวลาฟื้นฟู');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to calculate compatibility');
      }

      const data: CompatibilityResult = await response.json();
      setResult(data);

      // Invalidate history so new item appears
      queryClient.invalidateQueries({ queryKey: ['compatibility', 'history'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setCalculating(false);
      setCalculationStep('');
    }
  }, [partnerName, day, month, year, relationshipType, config.loadingSteps, queryClient]);

  const handleBackToForm = () => {
    setResult(null);
    setViewingHistoryId(null);
  };

  const handleViewHistory = (id: string) => {
    setViewingHistoryId(id);
  };

  // --- Loading screen ---
  if (sessionLoading || !session) {
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

  // --- Calculating screen ---
  if (calculating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-royalPurple/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-md relative z-10"
        >
          <div className="relative">
            <div className="w-32 h-32 mx-auto relative">
              <motion.div
                className="absolute inset-0 border-4 border-royalPurple/20 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-2 border-4 border-amethyst/40 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-4 border-4 border-t-royalPurple border-r-transparent border-b-transparent border-l-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-4 h-4 bg-gradient-to-br from-royalPurple to-amethyst rounded-full shadow-lg shadow-royalPurple/50" />
              </motion.div>
            </div>
          </div>

          <div className="space-y-3">
            <motion.h2
              className="text-3xl font-heading text-ghostWhite"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              กำลังคำนวณ...
            </motion.h2>

            <AnimatePresence mode="wait">
              <motion.p
                key={calculationStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg text-ashGray font-oracle min-h-[28px]"
              >
                {calculationStep}
              </motion.p>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-royalPurple/60 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Result view ---
  if (result) {
    const resultConfig = RELATIONSHIP_CONFIG[result.relationshipType as RelationshipType] || config;
    const ResultIcon = resultConfig.icon;

    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Button
              variant="ghost"
              onClick={handleBackToForm}
              className="text-ashGray hover:text-ghostWhite -ml-2"
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

              <h1 className="text-3xl md:text-4xl font-heading text-ghostWhite">
                {resultConfig.resultTitle(result.partnerName)}
              </h1>

              {result.userElement && result.partnerElement && (
                <p className="text-ashGray text-sm">
                  ธาตุ{toThaiElement(result.userElement)} x ธาตุ{toThaiElement(result.partnerElement)}
                </p>
              )}
            </div>
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
                      <p className="text-sm text-ghostWhite">เจ้า</p>
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

          {/* Actions */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => setShowShareSheet(true)}
            >
              <Share2 className="w-5 h-5 mr-2" />
              แชร์ผลดวง
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={handleBackToForm}>
              ส่องดวงอีกครั้ง
            </Button>
          </motion.div>

          {/* Share Sheet */}
          <ShareSheet
            isOpen={showShareSheet}
            onClose={() => setShowShareSheet(false)}
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

  // --- Form view (default) ---
  const allHistoryItems = historyQuery.data?.pages.flatMap(p => p.data) || [];
  const totalHistory = historyQuery.data?.pages[0]?.total || 0;
  const isRateLimited = rateLimitCountdown > 0;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-heading text-ghostWhite">ส่องดวงความสัมพันธ์</h1>

            <div className="bg-darkPurple/20 border border-royalPurple/30 rounded-xl p-4 md:p-6 space-y-3">
              <h3 className="text-lg md:text-xl font-heading text-amethyst">
                ค้นพบความลับของความสัมพันธ์
              </h3>
              <ul className="text-left space-y-2 text-ashGray text-sm md:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-amethyst mt-1 flex-shrink-0">&#x2728;</span>
                  <span>วิเคราะห์ธาตุและดาวประจำวันเกิดของทั้งสองคน</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amethyst mt-1 flex-shrink-0">&#x1F4A1;</span>
                  <span>รับคำแนะนำเฉพาะตัวสำหรับทุกความสัมพันธ์</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amethyst mt-1 flex-shrink-0">&#x1F3AF;</span>
                  <span>คนคุย คนรัก หัวหน้า เพื่อนร่วมงาน เพื่อน ครอบครัว</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Relationship Type Selector */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <label className="block text-sm text-ashGray mb-3">เลือกประเภทความสัมพันธ์</label>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_TYPES.map((type) => {
              const typeConfig = RELATIONSHIP_CONFIG[type];
              const Icon = typeConfig.icon;
              const isSelected = relationshipType === type;

              return (
                <motion.button
                  key={type}
                  onClick={() => setRelationshipType(type)}
                  className={`inline-flex items-center gap-1.5 px-4 h-11 rounded-full text-sm font-medium transition-all border ${
                    isSelected
                      ? `${typeConfig.accentBg} ${typeConfig.accentBorder} ${typeConfig.accent}`
                      : 'bg-deepNight border-darkPurple/50 text-ashGray hover:border-royalPurple/50'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  {...(type === 'talking' ? {
                    initial: { boxShadow: '0 0 0 0 rgba(236, 72, 153, 0)' },
                    animate: isSelected ? {} : {
                      boxShadow: [
                        '0 0 0 0 rgba(236, 72, 153, 0)',
                        '0 0 8px 2px rgba(236, 72, 153, 0.3)',
                        '0 0 0 0 rgba(236, 72, 153, 0)',
                      ],
                    },
                    transition: { duration: 2, repeat: 1, delay: 0.5 },
                  } : {})}
                >
                  <Icon className="w-4 h-4" />
                  {RELATIONSHIP_LABELS[type]}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && !isRateLimited && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
            >
              <p className="text-red-400 text-center text-sm md:text-base">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rate Limit Card */}
        <AnimatePresence>
          {isRateLimited && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="bg-gradient-to-br from-darkPurple to-deepNight border-amethyst/30">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Moon className="w-10 h-10 text-amethyst mx-auto" />
                    </motion.div>
                    <p className="text-ghostWhite font-medium">พลังดวงดาวต้องการเวลาฟื้นฟู</p>
                    <p className="text-ashGray text-sm">
                      {rateLimitCountdown > 3600
                        ? 'เจ้าส่องดวงครบ 5 ครั้งในวันนี้แล้ว'
                        : 'เจ้าได้ส่องดวงครบ 5 ครั้งในชั่วโมงนี้แล้ว'}
                    </p>
                    <p className="text-amethyst text-sm">
                      {rateLimitCountdown > 3600
                        ? `กลับมาใหม่พรุ่งนี้นะ`
                        : `ดวงดาวจะพร้อมอีกครั้งใน ${Math.ceil(rateLimitCountdown / 60)} นาที`}
                    </p>
                    <div className="w-full bg-deepNight rounded-full h-1 overflow-hidden" role="progressbar" aria-label="เวลาที่เหลือก่อนส่องดวงได้อีกครั้ง">
                      <motion.div
                        className="h-full bg-amethyst/60 rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: rateLimitCountdown, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <AnimatePresence mode="wait">
                <motion.div
                  key={relationshipType}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <CardTitle className="text-lg md:text-xl">{config.cardTitle}</CardTitle>
                </motion.div>
              </AnimatePresence>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm text-ashGray mb-2">ชื่อ</label>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={relationshipType}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Input
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder={config.placeholder}
                      className="text-base"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-sm text-ashGray mb-3">วันเกิด</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-ashGray/70 mb-2 text-center">วัน</label>
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="w-full h-12 bg-charcoal border border-ashGray/30 rounded-lg text-center text-base text-ghostWhite focus:ring-2 focus:ring-amethyst focus:border-transparent transition-all cursor-pointer hover:border-amethyst/50"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-ashGray/70 mb-2 text-center">เดือน</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full h-12 bg-charcoal border border-ashGray/30 rounded-lg text-center text-sm text-ghostWhite focus:ring-2 focus:ring-amethyst focus:border-transparent transition-all cursor-pointer hover:border-amethyst/50"
                    >
                      {THAI_MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-ashGray/70 mb-2 text-center">พ.ศ.</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full h-12 bg-charcoal border border-ashGray/30 rounded-lg text-center text-base text-ghostWhite focus:ring-2 focus:ring-amethyst focus:border-transparent transition-all cursor-pointer hover:border-amethyst/50"
                    >
                      {Array.from({ length: 80 }, (_, i) => currentYear - i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-ashGray/60 mt-2 text-center">ตัวอย่าง: 15 มิถุนายน 2540</p>
              </div>

              <div className="space-y-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${relationshipType}-cta`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      onClick={handleCalculate}
                      size="lg"
                      className="w-full"
                      disabled={!partnerName.trim() || calculating || isRateLimited}
                    >
                      {isRateLimited ? (
                        <>
                          <Moon className="w-5 h-5 mr-2" />
                          ดวงดาวกำลังฟื้นฟู...
                        </>
                      ) : calculating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          กำลังคำนวณ...
                        </>
                      ) : (
                        config.cta
                      )}
                    </Button>
                  </motion.div>
                </AnimatePresence>

                {/* Low remaining warning */}
                {rateLimitInfo && rateLimitInfo.remaining <= 2 && rateLimitInfo.remaining > 0 && !isRateLimited && (
                  <p className="text-amber-400 text-xs text-center">ส่องดวงได้อีก {rateLimitInfo.remaining} ครั้งในวันนี้</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <PawjaiAdsBanner/>
        {/* History Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading text-ghostWhite flex items-center gap-2">
                <Stars className="w-5 h-5 text-amethyst" />
                ดวงที่เจ้าเคยส่อง
                {totalHistory > 0 && (
                  <span className="text-xs text-ashGray bg-deepNight px-2 py-0.5 rounded-full">
                    {totalHistory} ครั้ง
                  </span>
                )}
              </h2>
            </div>

            {historyQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-ashGray animate-spin" />
              </div>
            ) : allHistoryItems.length === 0 ? (
              // Empty state
              <div className="text-center py-8 space-y-3">
                <div className="flex justify-center gap-2 text-ashGray/40">
                  <Stars className="w-8 h-8" />
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-ashGray">ยังไม่มีประวัติการส่องดวง</p>
                <p className="text-ashGray/60 text-sm">ลองส่องดวงความสัมพันธ์กับคนรอบข้างเจ้าดูสิ</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allHistoryItems.map((item, index) => {
                  const itemConfig = RELATIONSHIP_CONFIG[item.relationshipType as RelationshipType];
                  if (!itemConfig) return null;
                  const ItemIcon = itemConfig.icon;

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleViewHistory(item.id)}
                      className="w-full bg-deepNight/50 border border-darkPurple/30 rounded-xl p-4 hover:border-royalPurple/30 transition-all text-left flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-full ${itemConfig.accentBg} flex items-center justify-center flex-shrink-0`}>
                        <ItemIcon className={`w-5 h-5 ${itemConfig.accent}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-ghostWhite font-medium truncate">{item.partnerName}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={itemConfig.accent}>{RELATIONSHIP_LABELS[item.relationshipType as RelationshipType]}</span>
                          {item.userElement && item.partnerElement && (
                            <>
                              <span className="text-ashGray/40">&#x2022;</span>
                              <span className="text-ashGray">{toThaiElement(item.userElement)} x {toThaiElement(item.partnerElement)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-ashGray">
                          {formatRelativeDate(item.createdAt)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-ashGray/50" />
                      </div>
                    </motion.button>
                  );
                })}

                {/* Load more */}
                {historyQuery.hasNextPage && (
                  <Button
                    variant="ghost"
                    className="w-full text-ashGray"
                    onClick={() => historyQuery.fetchNextPage()}
                    disabled={historyQuery.isFetchingNextPage}
                  >
                    {historyQuery.isFetchingNextPage ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    โหลดเพิ่ม
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
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
