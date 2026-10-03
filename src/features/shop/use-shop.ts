'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CatalogProductId, ShopProductResponse, ShopResponse } from '@/lib-packages/shared/types/shop';

export const SHOP_QUERY_KEY = ['shop'] as const;

export function useShop(enabled = true) {
  return useQuery({ queryKey: SHOP_QUERY_KEY, queryFn: () => api.get<ShopResponse>('/api/shop'), enabled, staleTime: 30_000 });
}

export function useShopProduct(productId: CatalogProductId | null, enabled = true) {
  return useQuery({
    queryKey: [...SHOP_QUERY_KEY, 'product', productId],
    queryFn: () => api.get<ShopProductResponse>(`/api/shop/products/${encodeURIComponent(productId!)}`),
    enabled: enabled && productId !== null,
    staleTime: 30_000,
  });
}
