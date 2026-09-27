'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WalletResponse } from '@/lib-packages/shared/types/wallet';

/** One cache entry for the balance chip, the ดวงคู่ door and /dashboard/wallet; invalidate it after a spend. */
export const WALLET_QUERY_KEY = ['wallet'] as const;

/** GET /api/wallet. The first call grants the welcome gift (horo-be/docs/wallet.md). */
export function useWallet() {
  return useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: () => api.get<WalletResponse>('/api/wallet'),
    staleTime: 30_000,
  });
}
