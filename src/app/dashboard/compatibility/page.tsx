'use client';

import { useMinLoading } from '@/hooks/use-min-loading';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  BE_OFFSET,
  createUTCDateFromBE,
  RelationshipTypeSchema,
  type CompatibilityResultOrigin,
  type CompatibilitySharePlatform,
  type RelationshipType,
} from '@/lib-packages/shared';
import { useInfiniteQuery, useQueryClient, useQuery } from '@tanstack/react-query';
import { api, type ApiError } from '@/lib/api';
import { useTrackSurfaceView } from '@/hooks/use-track-surface-view';
import { classifyCompatibilityFailure, useTrackEvent } from '@/lib/analytics';
import { PawjaiAdsBanner } from '@/components/ads/pawjai-ads-banner';
import {
  RELATIONSHIP_CONFIG,
  type CompatibilityResult,
  type HistoryResponse,
} from '@/features/compatibility/relationship-config';
import { CompatibilityForm } from '@/features/compatibility/compatibility-form';
import { CompatibilityLoading } from '@/features/compatibility/compatibility-loading';
import { CompatibilityResultView } from '@/features/compatibility/compatibility-result';
import { AutoDonationModal } from '@/components/ads/donation-modal';
import { CompatibilityHistory } from '@/features/compatibility/compatibility-history';
import { MainLoader } from '@/components/ui/main-loader';

// --- Page ---

export default function CompatibilityPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  useTrackSurfaceView('compatibility');
  const track = useTrackEvent();

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
  const calculationInFlight = useRef(false);
  const [calculationStep, setCalculationStep] = useState('');
  // Set once the scripted steps run out, which is when the real LLM wait starts.
  const [stepsExhausted, setStepsExhausted] = useState(false);
  // Floor the calculating screen at 3s so its copy and sponsored card are seen.
  const showCalculating = useMinLoading(calculating);
  const [error, setError] = useState('');

  // Result state
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [resultOrigin, setResultOrigin] = useState<CompatibilityResultOrigin>('fresh');
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
      setResultOrigin('history');
    }
  }, [historyDetailQuery.data]);

  const handleResultOpen = () => {
    if (!result) return;
    const parsedRelationshipType = RelationshipTypeSchema.safeParse(result.relationshipType);
    if (!parsedRelationshipType.success) return;
    track({
      event: 'result_opened',
      relationshipType: parsedRelationshipType.data,
      origin: resultOrigin,
    });
  };

  const handleCalculate = useCallback(async () => {
    if (calculationInFlight.current) return;
    if (!partnerName.trim()) {
      setError('ใส่ชื่ออีกฝ่ายก่อนนะ');
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    calculationInFlight.current = true;
    track({ event: 'calculation_started', relationshipType });
    setCalculating(true);
    setError('');
    setResult(null);
    setViewingHistoryId(null);
    setStepsExhausted(false);

    let resetAt = '';

    try {
      const steps = config.loadingSteps;
      for (let i = 0; i < steps.length - 1; i++) {
        setCalculationStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setCalculationStep(steps[steps.length - 1]);
      setStepsExhausted(true);

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
          // Backend allows up to four 60s attempts plus retry backoff.
          // Wait beyond its 255s socket budget instead of aborting at 45s.
          timeout: 270_000,
          onHeaders: (headers) => {
            const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '5');
            resetAt = headers.get('X-RateLimit-Reset') || '';
            setRateLimitInfo({ remaining, resetAt, retryAfter: 0 });
          },
        }
      );

      setResult(data);
      setResultOrigin(data.cached ? 'cache' : 'fresh');
      // After the call resolves, so a failed or rate-limited check is not counted.
      track({ event: 'compatibility_checked', relationshipType });

      // Invalidate history so new item appears
      queryClient.invalidateQueries({ queryKey: ['compatibility', 'history'] });
    } catch (raw) {
      // Narrowed here because a catch binding may only be typed `any` or
      // `unknown`; the handler below reads status/body/code off it.
      const err = raw as ApiError;
      track({
        event: 'calculation_failed',
        relationshipType,
        failureClass: classifyCompatibilityFailure(err),
      });
      if (err?.status === 429) {
        const retryAfter = err.body?.retryAfter || 3600;
        setRateLimitInfo({ remaining: 0, resetAt, retryAfter });
        setRateLimitCountdown(retryAfter);
        setError(err.body?.error || 'ครบจำนวนครั้งที่ดูได้แล้ว รอสักพักแล้วลองใหม่');
        return;
      }
      setError(err?.code === 'TIMEOUT'
        ? 'รอผลนานกว่าปกติ ลองเปิดประวัติดวงคู่ก่อน หากยังไม่มีผลค่อยลองอีกครั้งนะ'
        : err?.body?.error || (err instanceof Error ? err.message : 'ตอนนี้โหลดข้อมูลไม่ได้ ลองอีกครั้งนะ'));
    } finally {
      calculationInFlight.current = false;
      setCalculating(false);
      setCalculationStep('');
      setStepsExhausted(false);
    }
  }, [partnerName, day, month, year, partnerMbti, relationshipType, config.loadingSteps, queryClient, track]);

  const handleBackToForm = () => {
    setResult(null);
    setViewingHistoryId(null);
  };

  const handleViewHistory = (id: string) => {
    setViewingHistoryId(id);
  };

  const handleRelationshipTypeChange = (nextRelationshipType: RelationshipType) => {
    setRelationshipType(nextRelationshipType);
    track({ event: 'relationship_selected', relationshipType: nextRelationshipType });
  };

  const handleGuidanceOpen = () => {
    const parsedRelationshipType = RelationshipTypeSchema.safeParse(result?.relationshipType);
    if (!parsedRelationshipType.success) return;
    track({ event: 'guidance_opened', relationshipType: parsedRelationshipType.data });
  };

  const handleShareInitiated = (platform: CompatibilitySharePlatform) => {
    const parsedRelationshipType = RelationshipTypeSchema.safeParse(result?.relationshipType);
    if (!parsedRelationshipType.success) return;
    track({ event: 'compatibility_share_initiated', relationshipType: parsedRelationshipType.data, platform });
  };

  // --- Loading screen ---
  if (sessionLoading || !session) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-ground flex items-center justify-center">
        <MainLoader />
      </div>
    );
  }

  // --- Calculating screen ---
  if (showCalculating) {
    return (
      <CompatibilityLoading
        calculationStep={calculationStep}
        stepsExhausted={stepsExhausted}
      />
    );
  }

  // --- Result view ---
  if (result) {
    return (
      <>
        <CompatibilityResultView
          result={result}
          fallbackConfig={config}
          showShareSheet={showShareSheet}
          onOpenShareSheet={() => setShowShareSheet(true)}
          onCloseShareSheet={() => setShowShareSheet(false)}
          onBackToForm={handleBackToForm}
          onGuidanceOpen={handleGuidanceOpen}
          onShareInitiated={handleShareInitiated}
          onResultOpen={handleResultOpen}
        />

        {/* Auto-open donation modal. Only in the result branch: the form and
            history views below carry no reading to reward. */}
        <AutoDonationModal />
      </>
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
              src="/assets/clay/little-oracle-master-v1.webp"
              alt="มาสคอตนักพยากรณ์ของสายมู"
              width={1024}
              height={1024}
              sizes="112px"
              priority
              className="size-24 shrink-0 object-contain sm:size-28"
            />
            <div>
              <h1 className="font-heading text-3xl font-semibold text-ink md:text-4xl">ดูดวงคู่</h1>
              <p className="mt-2 max-w-[44ch] font-thai leading-relaxed text-inkMuted">
                คนคุย คนรัก หรือคนที่เจอทุกวัน ลองดูว่าเข้ากันตรงไหน แล้วค่อย ๆ เข้าใจกันมากขึ้น
              </p>
            </div>
          </div>
        </motion.div>

        <CompatibilityForm
          config={config}
          relationshipType={relationshipType}
          onRelationshipTypeChange={handleRelationshipTypeChange}
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
