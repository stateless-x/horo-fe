import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/lib-packages/ui';

interface ErrorDisplayProps {
  error: string;
}

/**
 * Error Display Component
 *
 * Shows error messages with a return to dashboard button.
 */
export function ErrorDisplay({ error }: ErrorDisplayProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-ghostWhite font-oracle">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-royalPurple hover:bg-amethyst text-ghostWhite rounded-md transition-all duration-200 font-heading shadow-md shadow-royalPurple/30 hover:shadow-lg hover:shadow-amethyst/30"
          >
            กลับสู่หน้าหลัก
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
