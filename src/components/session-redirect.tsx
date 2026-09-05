'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

/**
 * Sends signed-in visitors from the landing page to their dashboard.
 *
 * Renders nothing, so the page around it can stay a Server Component. It
 * replaces the old `if (session) return null` guard, which blanked the entire
 * landing page while the session resolved and the redirect ran — signed-in
 * users saw an empty screen. Now they see the landing page for the moment the
 * redirect takes, which is a better fallback if it is slow or fails.
 */
export function SessionRedirect() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && !isPending) {
      router.replace('/dashboard');
    }
  }, [session, isPending, router]);

  return null;
}
