'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { api, type ApiError } from '@/lib/api';
import type { OrderStatusResponse } from '@/lib-packages/shared/types/wallet';

export const ORDER_POLL_MS = 3_000;
/**
 * How often a pending order asks the payment provider itself (`?verify=1`)
 * instead of only reading our database. The webhook is the normal path; this
 * bounds a lost or late webhook to about this long instead of the QR lifetime.
 */
export const ORDER_VERIFY_EVERY_MS = 15_000;

export const orderQueryKey = (orderId: string) => ['wallet', 'order', orderId] as const;

const orderPath = (orderId: string) => `/api/wallet/orders/${orderId}`;

export function fetchOrder(orderId: string): Promise<OrderStatusResponse> {
  return api.get<OrderStatusResponse>(orderPath(orderId));
}

/**
 * GET /api/wallet/orders/:id every `pollMs` while the order is pending and the
 * tab is visible, and at once when the tab becomes visible again (the return
 * from the bank app). Every ORDER_VERIFY_EVERY_MS the poll asks the provider
 * instead (verifyOrder). Stops once the order leaves pending. `null` polls nothing.
 */
export function useOrderStatus(orderId: string | null, pollMs = ORDER_POLL_MS, verifyEveryMs = ORDER_VERIFY_EVERY_MS, awaitFulfilment = false) {
  const query = useQuery({
    queryKey: orderQueryKey(orderId ?? ''),
    queryFn: () => fetchOrder(orderId!),
    enabled: orderId !== null,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const queryClient = useQueryClient();
  const pending = !query.data || query.data.status === 'pending' || (awaitFulfilment && query.data.status === 'paid' && query.data.fulfilment === null);
  const { refetch } = query;

  useEffect(() => {
    if (orderId === null || !pending) return;
    const visible = () => document.visibilityState === 'visible';
    const verifyEvery = Math.max(1, Math.round(verifyEveryMs / pollMs));
    let ticks = 0;
    const timer = setInterval(() => {
      ticks += 1;
      if (!visible()) return;
      if (query.data?.status === 'pending' && ticks % verifyEvery === 0) {
        verifyOrder(queryClient, orderId).catch((error) => console.error('Order verify during polling failed:', error));
      } else {
        void refetch();
      }
    }, pollMs);
    const onVisibility = () => {
      if (visible()) void refetch();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [orderId, pending, pollMs, verifyEveryMs, queryClient, refetch, query.data?.status]);

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
