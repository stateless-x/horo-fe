'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Dashboard root page - redirects to /dashboard/today
 *
 * The daily fortune is now the dedicated experience at /dashboard/today.
 * This page handles the redirect for any existing links or bookmarks.
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/today');
  }, [router]);

  return null;
}
