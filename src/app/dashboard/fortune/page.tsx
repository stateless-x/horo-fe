'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/** Keeps saved monthly-reading links working after the route moved. */
export default function LegacyMonthlyFortunePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(`/dashboard/fortune/monthly${query ? `?${query}` : ''}`);
  }, [router, searchParams]);

  return null;
}
