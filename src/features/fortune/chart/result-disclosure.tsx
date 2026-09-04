import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface ResultDisclosureProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ResultDisclosure({ title, description, children }: ResultDisclosureProps) {
  return (
    <details className="group border-b border-edge">
      <summary className="flex min-h-20 cursor-pointer list-none items-center gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accentBright [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-lg font-semibold text-ink">{title}</span>
          <span className="mt-1 block font-thai text-sm text-inkMuted">{description}</span>
        </span>
        <ChevronDown className="size-5 shrink-0 text-inkMuted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="pb-10 pt-3">{children}</div>
    </details>
  );
}
