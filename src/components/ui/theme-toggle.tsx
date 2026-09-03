'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/**
 * Theme toggle — switches between the Midnight Room (dark, default) and the
 * white + purple daylight mode. Renders a stable placeholder until mounted so
 * SSR markup never disagrees with the client's resolved theme.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme !== 'light';

  return (
    <button
      type="button"
      aria-label="สลับโหมดสี"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-inkMuted hover:text-ink hover:bg-edgeSoft transition-colors touch-manipulation"
    >
      {mounted ? (
        isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />
      ) : (
        <span className="w-4.5 h-4.5" />
      )}
    </button>
  );
}
