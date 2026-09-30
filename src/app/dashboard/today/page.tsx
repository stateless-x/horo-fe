'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/** Keeps saved daily-reading links working after the route moved. */
export default function LegacyDailyFortunePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(`/dashboard/fortune/daily${query ? `?${query}` : ''}`);
  }, [router, searchParams]);

  return null;
}
