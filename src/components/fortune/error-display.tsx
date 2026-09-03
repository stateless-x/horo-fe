import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/lib-packages/ui';

interface ErrorDisplayProps {
  error: string;
  /** Show a retry button that reloads the page */
  showRetry?: boolean;
}

/**
 * Error Display Component
 *
 * Shows error messages with a return to dashboard button.
 */
export function ErrorDisplay({ error, showRetry }: ErrorDisplayProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-ink font-oracle">{error}</p>
          <div className="flex gap-3">
            {showRetry && (
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-accent hover:bg-accentBright text-accentInk rounded-md transition-all duration-200 font-heading shadow-md shadow-accent/30 hover:shadow-lg hover:shadow-accentBright/30"
              >
                ลองอีกครั้ง
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className={`${showRetry ? 'flex-1' : 'w-full'} py-3 ${showRetry ? 'border border-accent/50 text-inkMuted hover:text-accentInk' : 'bg-accent hover:bg-accentBright text-accentInk shadow-md shadow-accent/30 hover:shadow-lg hover:shadow-accentBright/30'} rounded-md transition-all duration-200 font-heading`}
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
