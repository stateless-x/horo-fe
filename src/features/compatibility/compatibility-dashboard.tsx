'use client';


import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {
  BE_OFFSET,
  createUTCDateFromBE,
  type CompatibilityResultOrigin,
  type RelationshipType,
} from '@/lib-packages/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type ApiError } from '@/lib/api';
import { useTrackSurfaceView } from '@/hooks/use-track-surface-view';
import { classifyCompatibilityFailure, useTrackEvent } from '@/lib/analytics';
import {
  RELATIONSHIP_CONFIG,
  type CompatibilityResult,
  type HistoryResponse,
} from '@/features/compatibility/relationship-config';
import { CompatibilityForm } from '@/features/compatibility/compatibility-form';
import { CompatibilityLoading } from '@/features/compatibility/compatibility-loading';
import { CompatibilityHistory } from '@/features/compatibility/compatibility-history';
import { PageLoadingState } from '@/components/ui/page-loading-state';
import { failureReference } from '@/components/ui/failure-notice';
import {
  compatibilityHistoryPath,
  compatibilityResultOriginKey,
  compatibilityResultPath,
} from '@/features/compatibility/compatibility-routes';
import { HISTORY_PREVIEW_LIMIT } from '@/features/compatibility/history-paging';

/** A server failure on the check (teaser). Pronoun-free; a teaser is free, so no charge line. */
export const TEASER_FAILED = 'เขียนดวงคู่ไม่สำเร็จ ลองใหม่ได้เลย';

/** The notice for a 5xx on the check, with the server's reference when sent; null for any other failure. */
export function teaserFailure(error: unknown): { message: string; reference?: string } | null {
  const status = (error as ApiError | null)?.status;
  if (typeof status !== 'number' || status < 500) return null;
  return { message: TEASER_FAILED, reference: failureReference(error) };
}

/** The history route also says whether a new check writes the teaser alone (locked mode). */
type HistoryPage = HistoryResponse & { lockEnabled?: boolean };

/** Signed-in compatibility creation and history experience. */
export function CompatibilityDashboard() {
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
  const [calculationStartedAt, setCalculationStartedAt] = useState(0);
  const [error, setError] = useState('');
  const [errorReference, setErrorReference] = useState<string | undefined>();
  /** Bumped per teaser failure so a repeat failure shows the toast again. */
  const [failureToast, setFailureToast] = useState(0);

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

  // The newest few checks; the full list lives on the history route.
  const historyQuery = useQuery<HistoryPage>({
    queryKey: ['compatibility', 'history', 'recent'],
    queryFn: () => api.get<HistoryPage>(`/api/fortune/compatibility/history?limit=${HISTORY_PREVIEW_LIMIT}`),
    enabled: !!session,
    staleTime: 60_000,
  });

  const handleCalculate = useCallback(async () => {
    if (calculationInFlight.current) return;
    if (!partnerName.trim()) {
      setError('ใส่ชื่ออีกฝ่ายก่อนนะ');
      setErrorReference(undefined);
      setFailureToast(0);
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    calculationInFlight.current = true;
    track({ event: 'calculation_started', relationshipType });
    setCalculating(true);
    setError('');
    setErrorReference(undefined);
    setFailureToast(0);
    // The request goes out now; the loading screen counts from here (no scripted steps before it).
    const startedAt = Date.now();
    setCalculationStartedAt(startedAt);

    let resetAt = '';

    try {
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
          // The server finishes a v4 report within its 220s model budget and
          // 255s socket budget (docs/compatibility-response-fix.md); wait past both.
          timeout: 270_000,
          onHeaders: (headers) => {
            const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '5');
            resetAt = headers.get('X-RateLimit-Reset') || '';
            setRateLimitInfo({ remaining, resetAt, retryAfter: 0 });
          },
        }
      );

      const origin: CompatibilityResultOrigin = data.cached ? 'cache' : 'fresh';
      queryClient.setQueryData(['compatibility', data.id], data);
      queryClient.setQueryData(compatibilityResultOriginKey(data.id), origin);
      router.push(compatibilityResultPath(data.id));
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
      const failure = teaserFailure(err);
      if (failure) {
        setError(failure.message);
        setErrorReference(failure.reference);
        setFailureToast((count) => count + 1);
        return;
      }
      setError(err?.code === 'TIMEOUT'
        ? 'รอผลนานกว่าปกติ ลองเปิดประวัติดวงคู่ก่อน หากยังไม่มีผลค่อยลองอีกครั้งนะ'
        : err?.body?.error || (err instanceof Error ? err.message : 'ตอนนี้โหลดข้อมูลไม่ได้ ลองอีกครั้งนะ'));
    } finally {
      calculationInFlight.current = false;
      setCalculating(false);
    }
  }, [partnerName, day, month, year, partnerMbti, relationshipType, queryClient, router, track]);

  const handleViewHistory = (id: string) => {
    router.push(compatibilityResultPath(id));
  };

  const handleRelationshipTypeChange = (nextRelationshipType: RelationshipType) => {
    setRelationshipType(nextRelationshipType);
    track({ event: 'relationship_selected', relationshipType: nextRelationshipType });
  };

  // --- Loading screen ---
  if (sessionLoading || !session) {
    return <PageLoadingState className="min-h-[calc(100vh-3.5rem)]" label="กำลังเปิดดวงคู่ของคุณ" />;
  }

  // --- Calculating screen ---
  if (calculating) {
    return (
      <CompatibilityLoading
        startedAt={calculationStartedAt}
        lockEnabled={historyQuery.data?.lockEnabled}
      />
    );
  }

  // --- Form view (default) ---
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
          errorReference={errorReference}
          failureToast={failureToast}
          onFailureToastDismiss={() => setFailureToast(0)}
          calculating={calculating}
          isRateLimited={isRateLimited}
          rateLimitCountdown={rateLimitCountdown}
          rateLimitInfo={rateLimitInfo}
          onCalculate={handleCalculate}
        />

        {/* History Section */}
        <CompatibilityHistory
          items={historyQuery.data?.data ?? []}
          totalHistory={historyQuery.data?.total ?? 0}
          isLoading={historyQuery.isLoading}
          isError={historyQuery.isError}
          onRetry={() => historyQuery.refetch()}
          onViewHistory={handleViewHistory}
          seeAllHref={compatibilityHistoryPath()}
        />

      </div>
    </div>
  );
}
