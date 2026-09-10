'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/lib-packages/ui';
import { rateLimitRetryAfterSeconds } from '@/lib/api';

interface ErrorDisplayProps {
  /** Fallback message, used when the error itself has nothing better to say. */
  error: string;
  /** Show a retry button that reloads the page */
  showRetry?: boolean;
  /**
   * The failure itself, when the caller has it. A rate limit is rendered as a
   * wait rather than a fault: retrying a 429 cannot succeed, and each attempt
   * spends another token and pushes the reset further out, so the retry button
   * is withheld until the window has actually passed.
   */
  cause?: unknown;
}

/** mm:ss for a countdown; minutes only once the wait is long. */
function formatWait(totalSeconds: number): string {
  if (totalSeconds >= 90) return `${Math.ceil(totalSeconds / 60)} นาที`;
  return `${totalSeconds} วินาที`;
}

/**
 * Error Display Component
 *
 * Shows error messages with a return to dashboard button.
 */
export function ErrorDisplay({ error, showRetry, cause }: ErrorDisplayProps) {
  const router = useRouter();
  const initialWait = rateLimitRetryAfterSeconds(cause);
  const [secondsLeft, setSecondsLeft] = useState(initialWait);

  // Tick a rate-limit wait down so the button becomes available exactly when
  // the window opens, without the user reloading to find out.
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const isRateLimited = initialWait !== null;
  const stillWaiting = isRateLimited && secondsLeft !== null && secondsLeft > 0;
  // A rate limit always offers retry once the wait is over, whatever the caller
  // asked for; every other failure follows the caller's showRetry.
  const canRetry = isRateLimited ? !stillWaiting : Boolean(showRetry);

  const message = isRateLimited
    ? 'วันนี้เปิดดวงบ่อยไปหน่อย พักสักครู่แล้วค่อยมาใหม่นะ'
    : error;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="text-4xl">{isRateLimited ? '🕰️' : '⚠️'}</div>
          <p className="text-ink font-oracle">{message}</p>
          {stillWaiting && (
            <p aria-live="polite" className="text-inkMuted text-sm font-oracle">
              ลองใหม่ได้ในอีก {formatWait(secondsLeft)}
            </p>
          )}
          <div className="flex gap-3">
            {canRetry && (
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-accent hover:bg-accentBright text-accentInk rounded-md transition-all duration-200 font-heading shadow-md shadow-accent/30 hover:shadow-lg hover:shadow-accentBright/30"
              >
                ลองอีกครั้ง
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className={`${canRetry ? 'flex-1' : 'w-full'} py-3 ${canRetry ? 'border border-accent/50 text-inkMuted hover:text-accentInk' : 'bg-accent hover:bg-accentBright text-accentInk shadow-md shadow-accent/30 hover:shadow-lg hover:shadow-accentBright/30'} rounded-md transition-all duration-200 font-heading`}
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
