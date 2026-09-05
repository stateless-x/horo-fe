import type { ReactNode } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

interface ResultDisclosureProps {
  title: string;
  description: string;
  image?: { src: string; alt?: string };
  children: ReactNode;
}

export function ResultDisclosure({ title, description, image, children }: ResultDisclosureProps) {
  return (
    <details className="group border-b border-edge">
      <summary className="flex min-h-20 cursor-pointer list-none items-center gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accentBright [&::-webkit-details-marker]:hidden">
        {image && (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface2">
            <Image
              src={image.src}
              alt={image.alt ?? ''}
              width={48}
              height={48}
              sizes="48px"
              className="object-contain"
            />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-lg font-semibold text-ink">{title}</span>
          <span className="mt-1 block font-thai text-sm text-inkMuted">{description}</span>
        </span>
        <ChevronDown className="size-5 shrink-0 text-accentBright transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="pb-10 pt-3">{children}</div>
    </details>
  );
}
