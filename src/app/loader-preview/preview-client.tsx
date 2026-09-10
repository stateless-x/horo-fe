'use client';

/**
 * Interactive body of the TEMPORARY loader preview. The dev-only gate lives in
 * page.tsx, which is a server component — `notFound()` is only authoritative
 * there. Delete `src/app/loader-preview/` when you're done.
 */

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { MainLoader } from '@/components/ui/main-loader';
import { CompatibilityLoading } from '@/features/compatibility/compatibility-loading';
import { LoadingSkeleton } from '@/features/fortune/loading-skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type View = 'bare' | 'fortune' | 'compatibility' | 'teaser';

const VIEWS: { id: View; label: string; note: string }[] = [
  { id: 'bare', label: 'MainLoader (bare)', note: 'The component on its own — glow + mascot, nothing else.' },
  { id: 'fortune', label: 'Fortune generation', note: 'features/fortune/loading-skeleton.tsx — rotating copy, decorative loader.' },
  { id: 'compatibility', label: 'Compatibility calc', note: 'features/compatibility/compatibility-loading.tsx — particles + step text.' },
  { id: 'teaser', label: 'Onboarding teaser', note: 'components/onboarding/step-teaser.tsx — loader + single line.' },
];

export function LoaderPreview() {
  const [view, setView] = useState<View>('bare');
  const { resolvedTheme } = useTheme();
  // next-themes only resolves on the client, so rendering the theme name
  // directly would disagree with the server markup. Render a stable
  // placeholder until mounted — same guard as components/ui/theme-toggle.tsx.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const themeLabel = mounted ? (resolvedTheme ?? 'light') : '\u00a0\u00a0\u00a0\u00a0\u00a0';

  return (
    <div className="min-h-screen bg-ground">
      {/* Switcher */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-ground/90 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-inkMuted">
              loader preview · dev only · animation loops forever
            </p>
            <div className="flex items-center gap-1">
              {/* The site's own ThemeToggle, not a preview-local copy — it
                  drives next-themes' data-theme, so what you see here is the
                  real theme behaviour rather than a simulation. */}
              <span className="font-mono text-[11px] text-inkMuted">{themeLabel}</span>
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  view === v.id
                    ? 'bg-accentBright text-white'
                    : 'bg-surface text-inkMuted hover:text-ink'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="mt-2 font-mono text-[11px] text-inkMuted">
            {VIEWS.find((v) => v.id === view)?.note}
          </p>
        </div>
      </div>

      {/* The loader in context. Each real screen renders full-bleed, exactly as
          it does in the app — no wrapper, so what you see is what ships. */}
      {view === 'bare' && (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-10">
          <MainLoader label="กำลังโหลด" />
          <div className="text-center font-mono text-xs text-inkMuted">
            <p>16 poses · 500ms each · 8s per loop · 209KB animated WebP</p>
            <p className="mt-1 text-inkMuted/60">
              Reduced-motion visitors get the static peek poster instead.
            </p>
          </div>
        </div>
      )}

      {view === 'fortune' && <LoadingSkeleton isLoading />}

      {view === 'compatibility' && (
        <CompatibilityLoading calculationStep="กำลังอ่านพลังธาตุของคุณ..." />
      )}

      {view === 'teaser' && (
        <div className="flex min-h-[70vh] items-center justify-center p-6">
          <div className="flex flex-col gap-6 text-center">
            <MainLoader label="กำลังเปิดดวงให้คุณ" />
            <p className="font-oracle text-lg text-inkMuted">กำลังเปิดดวงให้คุณ...</p>
          </div>
        </div>
      )}
    </div>
  );
}
