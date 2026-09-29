import { PACK_IDS, type PackId } from '@/lib-packages/shared/types/wallet';

/**
 * The one order waiting for payment, kept across a reload or a trip to the
 * bank app (monetization T7). One key: a new checkout replaces it; paid,
 * failed or expired clears it.
 */
export const PENDING_ORDER_KEY = 'horo:wallet:pending-order';

export interface PendingOrder {
  orderId: string;
  packId: PackId;
  /** Set for a one-flow purchase from a ดวงคู่ door: only that door resumes it. */
  unlockRef?: string;
}

export function readPendingOrder(): PendingOrder | null {
  const raw = window.localStorage.getItem(PENDING_ORDER_KEY);
  if (!raw) return null;
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') return null;
  const { orderId, packId, unlockRef } = value as Record<string, unknown>;
  if (typeof orderId !== 'string' || !PACK_IDS.includes(packId as PackId)) return null;
  return { orderId, packId: packId as PackId, unlockRef: typeof unlockRef === 'string' ? unlockRef : undefined };
}

export function writePendingOrder(order: PendingOrder): void {
  window.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
}

export function clearPendingOrder(orderId: string): void {
  // Only the order this sheet owns: a newer checkout elsewhere keeps its entry.
  if (readPendingOrder()?.orderId === orderId) window.localStorage.removeItem(PENDING_ORDER_KEY);
}
