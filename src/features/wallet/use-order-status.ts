'use client';

import { useEffect } from 'react';
import { useQuery, type QueryClient } from '@tanstack/react-query';
import { api, type ApiError } from '@/lib/api';
import type { OrderStatusResponse } from '@/lib-packages/shared/types/wallet';

export const ORDER_POLL_MS = 3_000;

export const orderQueryKey = (orderId: string) => ['wallet', 'order', orderId] as const;

const orderPath = (orderId: string) => `/api/wallet/orders/${orderId}`;

export function fetchOrder(orderId: string): Promise<OrderStatusResponse> {
  return api.get<OrderStatusResponse>(orderPath(orderId));
}

/**
 * GET /api/wallet/orders/:id every `pollMs` while the order is pending and the
 * tab is visible, and at once when the tab becomes visible again (the return
 * from the bank app). Stops once the order leaves pending. `null` polls nothing.
 */
export function useOrderStatus(orderId: string | null, pollMs = ORDER_POLL_MS) {
  const query = useQuery({
    queryKey: orderQueryKey(orderId ?? ''),
    queryFn: () => fetchOrder(orderId!),
    enabled: orderId !== null,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const pending = !query.data || query.data.status === 'pending';
  const { refetch } = query;

  useEffect(() => {
    if (orderId === null || !pending) return;
    const visible = () => document.visibilityState === 'visible';
    const timer = setInterval(() => {
      if (visible()) void refetch();
    }, pollMs);
    const onVisibility = () => {
      if (visible()) void refetch();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [orderId, pending, pollMs, refetch]);

  return query;
}

/**
 * `?verify=1`: asks the payment provider now, for a missed webhook. The server
 * allows one per 5 s; a 429 means one just ran, so it is dropped quietly and
 * the regular poll carries on.
 */
export async function verifyOrder(queryClient: QueryClient, orderId: string): Promise<void> {
  try {
    queryClient.setQueryData(orderQueryKey(orderId), await api.get<OrderStatusResponse>(`${orderPath(orderId)}?verify=1`));
  } catch (error) {
    if ((error as ApiError).status === 429) return;
    throw error;
  }
}
