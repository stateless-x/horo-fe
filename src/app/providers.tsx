'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { queryClient } from '@/lib/query-client';
import { captureSignupSource } from '@/lib/signup-source';

export function Providers({ children }: { children: React.ReactNode }) {
  // Record where this visit came from before OAuth wipes the referrer/query string
  useEffect(() => {
    captureSignupSource();
  }, []);

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
