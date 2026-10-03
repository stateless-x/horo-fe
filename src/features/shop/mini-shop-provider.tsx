'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogProductId, ShopOffer } from '@/lib-packages/shared/types/shop';
import { MiniShopDialog } from '@/features/wallet/mini-shop-dialog';
import { cancelPendingOrder, readPendingOrder } from '@/features/wallet/pending-order';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { compatibilityResultPath } from '@/features/compatibility/compatibility-routes';
import { useSession } from '@/lib/auth-client';

export type MiniShopEntry = 'shop' | 'mini_shop';
export interface OpenProductOptions {
  entry: MiniShopEntry;
  unlockRef?: string;
  onComplete?: () => void | Promise<void>;
  resumeOffer?: ShopOffer;
}

interface MiniShopState extends OpenProductOptions {
  userId: string;
  productId: CatalogProductId;
}

const MiniShopContext = createContext<{ openProduct: (productId: CatalogProductId, options: OpenProductOptions) => void }>({
  openProduct: () => { throw new Error('useMiniShop must be used inside MiniShopProvider'); },
});

export function MiniShopProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user.id ?? null;
  const router = useRouter();
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const queryClient = useQueryClient();
  const [state, setState] = useState<MiniShopState | null>(null);
  const resumedForUser = useRef<string | null>(null);
  const openProduct = useCallback((productId: CatalogProductId, options: OpenProductOptions) => {
    if (userId) setState({ userId, productId, ...options });
  }, [userId]);
  const value = useMemo(() => ({ openProduct }), [openProduct]);
  const activeState = state?.userId === userId ? state : null;

  useEffect(() => {
    if (!userId || resumedForUser.current === userId) return;
    if (resumedForUser.current !== null) setState(null);
    resumedForUser.current = userId;
    const pending = readPendingOrder(userId);
    const onShop = pathname === '/dashboard/shop';
    const onReport = pending?.unlockRef && pathname === compatibilityResultPath(pending.unlockRef);
    if (pending?.productId && pending.offer && (onShop || onReport)) {
      setState({ userId, productId: pending.productId, entry: 'mini_shop', unlockRef: pending.unlockRef, resumeOffer: pending.offer });
    }
  }, [pathname, userId]);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    setState(null);
    if (!userId) return;
    const pending = readPendingOrder(userId);
    if (pending) void cancelPendingOrder(userId, pending.orderId)
      .catch((error) => console.error('Canceling the QR on navigation failed; it can still be checked on return:', error));
  }, [pathname, userId]);

  return (
    <MiniShopContext.Provider value={value}>
      {children}
      <MiniShopDialog
        userId={userId}
        open={activeState !== null}
        onOpenChange={(open) => !open && setState(null)}
        productId={activeState?.productId ?? null}
        entry={activeState?.entry ?? 'mini_shop'}
        unlockRef={activeState?.unlockRef}
        resumeOffer={activeState?.resumeOffer}
        onPurchased={async () => {
          const complete = activeState?.onComplete;
          setState(null);
          if (complete) await complete();
          else if (activeState?.unlockRef) {
            await queryClient.invalidateQueries({ queryKey: ['compatibility', activeState.unlockRef] });
            router.replace(compatibilityResultPath(activeState.unlockRef));
          }
        }}
      />
    </MiniShopContext.Provider>
  );
}

export function useMiniShop() {
  return useContext(MiniShopContext);
}
