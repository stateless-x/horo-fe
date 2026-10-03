import { MainLoader } from '@/components/ui/main-loader';

interface PageLoadingStateProps {
  label: string;
  className?: string;
}

/** A branded, quiet state for short route and session waits. */
export function PageLoadingState({ label, className = 'min-h-screen' }: PageLoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`${className} flex flex-col items-center justify-center gap-4 bg-ground px-6 text-center`}
    >
      <MainLoader size="compact" animate={false} decorative />
      <p className="font-oracle text-base text-inkMuted">{label}</p>
    </div>
  );
}
