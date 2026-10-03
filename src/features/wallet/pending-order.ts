import { PACK_IDS, type PackId } from '@/lib-packages/shared/types/wallet';
import type { ShopOffer } from '@/lib-packages/shared/types/shop';
import { api } from '@/lib/api';

/**
 * The one order waiting for payment, kept across a reload or a trip to the
 * bank app (monetization T7). Each account gets its own key so a user switch
 * cannot reopen, inspect, or cancel the previous account's checkout.
 */
const LEGACY_PENDING_ORDER_KEY = 'horo:wallet:pending-order';
export const PENDING_ORDER_KEY_PREFIX = `${LEGACY_PENDING_ORDER_KEY}:v2`;

export function pendingOrderKey(userId: string): string {
  return `${PENDING_ORDER_KEY_PREFIX}:${encodeURIComponent(userId)}`;
}

export interface PendingOrder {
  orderId: string;
  packId: PackId;
  /** Set when checkout also opens a ดวงคู่ report. */
  unlockRef?: string;
  productId?: string;
  offer?: ShopOffer;
}

type StoredPendingOrder = PendingOrder & { version: 2; userId: string };

function removeStoredOrder(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Persistence is best-effort. The live checkout must keep working when
    // storage is blocked or full.
  }
}

export function readPendingOrder(userId: string): PendingOrder | null {
  // The legacy record has no owner, so it cannot be resumed safely.
  removeStoredOrder(LEGACY_PENDING_ORDER_KEY);
  const key = pendingOrderKey(userId);
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return null;
  }
  if (!raw) return null;
  let value: unknown;
  try { value = JSON.parse(raw); } catch { removeStoredOrder(key); return null; }
  if (!value || typeof value !== 'object') { removeStoredOrder(key); return null; }
  const { version, userId: storedUserId, orderId, packId, unlockRef, productId, offer } = value as Record<string, unknown>;
  if (version !== 2 || storedUserId !== userId || typeof orderId !== 'string' || !PACK_IDS.includes(packId as PackId)) {
    removeStoredOrder(key);
    return null;
  }
  if (offer !== undefined && (!offer || typeof offer !== 'object' || typeof (offer as ShopOffer).id !== 'string' || typeof (offer as ShopOffer).priceMoo !== 'number')) {
    removeStoredOrder(key);
    return null;
  }
  return { orderId, packId: packId as PackId, unlockRef: typeof unlockRef === 'string' ? unlockRef : undefined, productId: typeof productId === 'string' ? productId : undefined, offer: offer as ShopOffer | undefined };
}

export function writePendingOrder(userId: string, order: PendingOrder): void {
  const stored: StoredPendingOrder = { version: 2, userId, ...order };
  try {
    window.localStorage.setItem(pendingOrderKey(userId), JSON.stringify(stored));
  } catch {
    // The open sheet still owns the checkout in memory. Only reload recovery
    // is unavailable when browser storage cannot be written.
  }
}

export function clearPendingOrder(userId: string, orderId: string): void {
  // Only the order this sheet owns: a newer checkout elsewhere keeps its entry.
  if (readPendingOrder(userId)?.orderId === orderId) removeStoredOrder(pendingOrderKey(userId));
}

/** Dismiss an unpaid QR at the provider. Keep the local record on network
 * failure or a raced payment so the next visit can reconcile it. */
export async function cancelPendingOrder(userId: string, orderId: string): Promise<string> {
  const result = await api.post<{ status: string }>(`/api/wallet/orders/${orderId}/cancel`, {});
  if (result.status !== 'pending' && result.status !== 'paid') clearPendingOrder(userId, orderId);
  return result.status;
}
