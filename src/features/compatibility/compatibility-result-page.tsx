'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RelationshipTypeSchema,
  type CompatibilityResultOrigin,
  type CompatibilitySharePlatform,
} from '@/lib-packages/shared';
import { Button } from '@/lib-packages/ui';
import { useSession } from '@/lib/auth-client';
import { api, type ApiError } from '@/lib/api';
import { useTrackSurfaceView } from '@/hooks/use-track-surface-view';
import { useTrackEvent } from '@/lib/analytics';
import { MainLoader } from '@/components/ui/main-loader';
import { CompatibilityResultView } from '@/features/compatibility/compatibility-result';
import {
  RELATIONSHIP_CONFIG,
  type CompatibilityResult,
} from '@/features/compatibility/relationship-config';
import {
  COMPATIBILITY_DASHBOARD_PATH,
  compatibilityResultFailureKind,
  compatibilityResultOriginKey,
} from '@/features/compatibility/compatibility-routes';

interface CompatibilityResultPageProps {
  resultId: string;
}

/** Lightweight controller for one authenticated, bookmarkable compatibility report. */
export function CompatibilityResultPage({ resultId }: CompatibilityResultPageProps) {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const track = useTrackEvent();
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [resultOrigin] = useState<CompatibilityResultOrigin>(() =>
    queryClient.getQueryData(compatibilityResultOriginKey(resultId)) ?? 'history',
  );

  useTrackSurfaceView('compatibility');

  useEffect(() => {
    if (!session && !sessionLoading) router.push('/login');
  }, [router, session, sessionLoading]);

  useEffect(() => {
    queryClient.removeQueries({ queryKey: compatibilityResultOriginKey(resultId), exact: true });
  }, [queryClient, resultId]);

  const resultQuery = useQuery<CompatibilityResult>({
    queryKey: ['compatibility', resultId],
    queryFn: () => api.get<CompatibilityResult>(`/api/fortune/compatibility/${resultId}`),
    enabled: !!session,
    staleTime: Infinity,
  });

  const result = resultQuery.data;

  const handleUnlock = useCallback(async () => {
    if (!result) return;
    try {
      const unlocked = await api.post<CompatibilityResult>(
        `/api/fortune/compatibility/${result.id}/unlock`,
        {},
        { timeout: 270_000 },
      );
      queryClient.setQueryData(['compatibility', unlocked.id], unlocked);
    } catch (error) {
      console.error('Compatibility unlock failed:', error);
      if ((error as ApiError).status === 402) throw error;
      const message = (error as ApiError).body?.error;
      throw new Error(typeof message === 'string' ? message : 'เขียนฉบับเต็มไม่สำเร็จ ลองอีกครั้งนะ');
    }
  }, [queryClient, result]);

  const handleResultOpen = useCallback(() => {
    const relationship = RelationshipTypeSchema.safeParse(result?.relationshipType);
    if (!relationship.success) return;
    track({ event: 'result_opened', relationshipType: relationship.data, origin: resultOrigin });
  }, [result?.relationshipType, resultOrigin, track]);

  const handleGuidanceOpen = () => {
    const relationship = RelationshipTypeSchema.safeParse(result?.relationshipType);
    if (!relationship.success) return;
    track({ event: 'guidance_opened', relationshipType: relationship.data });
  };

  const handleShareInitiated = (platform: CompatibilitySharePlatform) => {
    const relationship = RelationshipTypeSchema.safeParse(result?.relationshipType);
    if (!relationship.success) return;
    track({ event: 'compatibility_share_initiated', relationshipType: relationship.data, platform });
  };

  if (sessionLoading || !session || resultQuery.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-ground">
        <MainLoader label="กำลังเปิดผลดวงของคุณ" />
      </div>
    );
  }

  if (resultQuery.isError) {
    const unavailable = compatibilityResultFailureKind(resultQuery.error) === 'unavailable';
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <div className="max-w-sm space-y-4 text-center">
          <Image
            src="/assets/clay/little-oracle-mark-v1.webp"
            alt=""
            width={480}
            height={480}
            sizes="96px"
            className="mx-auto size-24 object-contain"
          />
          <h1 className="font-heading text-2xl text-ink">
            {unavailable ? 'เปิดผลดวงนี้ไม่ได้' : 'ตอนนี้ยังเปิดผลดวงไม่ได้'}
          </h1>
          <p className="font-thai leading-relaxed text-inkMuted">
            {unavailable
              ? 'ลิงก์อาจไม่ถูกต้อง หรือผลดวงนี้ไม่ได้อยู่ในบัญชีของคุณ'
              : 'การเชื่อมต่อสะดุดนิดหน่อย ลองโหลดผลดวงอีกครั้งนะ'}
          </p>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
            {!unavailable && (
              <Button onClick={() => resultQuery.refetch()} className="min-h-11">
                ลองอีกครั้ง
              </Button>
            )}
            <Button
              variant={unavailable ? 'default' : 'ghost'}
              onClick={() => router.replace(COMPATIBILITY_DASHBOARD_PATH)}
              className="min-h-11"
            >
              กลับไปดูดวงคู่
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <CompatibilityResultView
      result={result}
      fallbackConfig={RELATIONSHIP_CONFIG.talking}
      showShareSheet={showShareSheet}
      onOpenShareSheet={() => setShowShareSheet(true)}
      onCloseShareSheet={() => setShowShareSheet(false)}
      onBackToForm={() => router.replace(COMPATIBILITY_DASHBOARD_PATH)}
      onGuidanceOpen={handleGuidanceOpen}
      onShareInitiated={handleShareInitiated}
      onResultOpen={handleResultOpen}
      onUnlock={handleUnlock}
    />
  );
}
