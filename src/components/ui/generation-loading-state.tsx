import type { ReactNode } from 'react';
import { MainLoader } from '@/components/ui/main-loader';

interface GenerationLoadingStateProps {
  label: string;
  detail?: string;
  children?: ReactNode;
  className?: string;
}

/** The shared long-wait state for a personalised reading being prepared. */
export function GenerationLoadingState({
  label,
  detail,
  children,
  className = 'min-h-screen',
}: GenerationLoadingStateProps) {
  return (
    <div className={`${className} flex items-center justify-center bg-ground px-6 py-10`}>
      <div role="status" aria-live="polite" aria-atomic="true" className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <MainLoader decorative />
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-ink sm:text-2xl">{label}</h2>
          {detail && <p className="mx-auto max-w-[32ch] font-oracle text-sm leading-relaxed text-inkMuted sm:text-base">{detail}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
