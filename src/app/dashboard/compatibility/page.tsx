'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { BE_OFFSET, createUTCDateFromBE, type RelationshipType } from '@/lib-packages/shared';
import { useInfiniteQuery, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PawjaiAdsBanner } from '@/components/ads/pawjai-ads-banner';
import {
  RELATIONSHIP_CONFIG,
  type CompatibilityResult,
  type HistoryResponse,
} from '@/features/compatibility/relationship-config';
import { CompatibilityForm } from '@/features/compatibility/compatibility-form';
import { CompatibilityLoading } from '@/features/compatibility/compatibility-loading';
import { CompatibilityResultView } from '@/features/compatibility/compatibility-result';
import { CompatibilityHistory } from '@/features/compatibility/compatibility-history';

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
  const [partnerMbti, setPartnerMbti] = useState('');

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

    let resetAt = '';

    try {
      const steps = config.loadingSteps;
      for (let i = 0; i < steps.length - 1; i++) {
        setCalculationStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setCalculationStep(steps[steps.length - 1]);

      const birthDate = createUTCDateFromBE(dayNum, monthNum, yearNum);

      const data = await api.post<CompatibilityResult>(
        '/api/fortune/compatibility',
        {
          partnerName: partnerName.trim(),
          partnerBirthDate: birthDate.toISOString(),
          relationshipType,
          ...(partnerMbti ? { partnerMbti } : {}),
        },
        {
          onHeaders: (headers) => {
            const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '5');
            resetAt = headers.get('X-RateLimit-Reset') || '';
            setRateLimitInfo({ remaining, resetAt, retryAfter: 0 });
          },
        }
      );

      setResult(data);

      // Invalidate history so new item appears
      queryClient.invalidateQueries({ queryKey: ['compatibility', 'history'] });
    } catch (err: any) {
      if (err?.status === 429) {
        const retryAfter = err.body?.retryAfter || 3600;
        setRateLimitInfo({ remaining: 0, resetAt, retryAfter });
        setRateLimitCountdown(retryAfter);
        setError(err.body?.error || 'พลังดวงดาวต้องการเวลาฟื้นฟู');
        return;
      }
      setError(err?.body?.error || (err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'));
    } finally {
      setCalculating(false);
      setCalculationStep('');
    }
  }, [partnerName, day, month, year, partnerMbti, relationshipType, config.loadingSteps, queryClient]);

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
      <div className="min-h-[calc(100vh-3.5rem)] bg-ground flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  // --- Calculating screen ---
  if (calculating) {
    return <CompatibilityLoading calculationStep={calculationStep} />;
  }

  // --- Result view ---
  if (result) {
    return (
      <CompatibilityResultView
        result={result}
        fallbackConfig={config}
        showShareSheet={showShareSheet}
        onOpenShareSheet={() => setShowShareSheet(true)}
        onCloseShareSheet={() => setShowShareSheet(false)}
        onBackToForm={handleBackToForm}
      />
    );
  }

  // --- Form view (default) ---
  const allHistoryItems = historyQuery.data?.pages.flatMap(p => p.data) || [];
  const totalHistory = historyQuery.data?.pages[0]?.total || 0;
  const isRateLimited = rateLimitCountdown > 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-edge bg-surface px-5 py-6 shadow-[0_18px_50px_rgba(107,33,168,0.08)] md:px-8 md:py-7">
          <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-accentBright/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <Image
              src="/assets/clay/little-oracle-master-v1.png"
              alt="มาสคอตนักพยากรณ์ของสายมู"
              width={1024}
              height={1024}
              sizes="112px"
              priority
              className="size-24 shrink-0 object-contain sm:size-28"
            />
            <div>
              <h1 className="font-heading text-3xl font-semibold text-ink md:text-4xl">ส่องดวงความสัมพันธ์</h1>
              <p className="mt-2 max-w-[44ch] font-thai leading-relaxed text-inkMuted">
                เลือกความสัมพันธ์ แล้วบอกชื่อกับวันเกิดของอีกฝ่าย เหลือให้ดวงดาวอ่านจังหวะของทั้งคู่
              </p>
            </div>
          </div>
        </motion.div>

        <CompatibilityForm
          config={config}
          relationshipType={relationshipType}
          onRelationshipTypeChange={setRelationshipType}
          partnerName={partnerName}
          onPartnerNameChange={setPartnerName}
          day={day}
          onDayChange={setDay}
          month={month}
          onMonthChange={setMonth}
          year={year}
          onYearChange={setYear}
          partnerMbti={partnerMbti}
          onPartnerMbtiChange={setPartnerMbti}
          currentYear={currentYear}
          error={error}
          calculating={calculating}
          isRateLimited={isRateLimited}
          rateLimitCountdown={rateLimitCountdown}
          rateLimitInfo={rateLimitInfo}
          onCalculate={handleCalculate}
        />

        {/* History Section */}
        <CompatibilityHistory
          items={allHistoryItems}
          totalHistory={totalHistory}
          isLoading={historyQuery.isLoading}
          hasNextPage={!!historyQuery.hasNextPage}
          isFetchingNextPage={historyQuery.isFetchingNextPage}
          onLoadMore={() => historyQuery.fetchNextPage()}
          onViewHistory={handleViewHistory}
        />

        {/* Ad sits after the form + history value unit */}
        <PawjaiAdsBanner />
      </div>
    </div>
  );
}
