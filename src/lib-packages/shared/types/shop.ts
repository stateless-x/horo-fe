// GENERATED from horo-be/lib/shared/types — do not edit. Run `bun run sync:types` in horo-be.
import { z } from 'zod';

/**
 * The Shop catalog: vocabulary and response shapes shared by the API
 * (src/routes/shop.ts, src/routes/wallet.ts) and the frontend. Contract:
 * docs/shop-catalog-plan.md §6. Offer prices live in the catalog_offers table,
 * never here.
 */

/** Shop categories, in display order. */
export const SHOP_CATEGORIES = [{ id: 'eticket', name: 'eTicket' }] as const;
export type ShopCategoryId = (typeof SHOP_CATEGORIES)[number]['id'];

/** How a product is delivered. `physical` has no fulfilment handler yet, so it can't be published. */
export const PRODUCT_TYPES = ['feature_credit', 'physical'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const CATALOG_STATUSES = ['draft', 'published', 'archived'] as const;
export type CatalogStatus = (typeof CATALOG_STATUSES)[number];

/** `bonus` → the prominent "แถม {bonusQuantity}" chip; `recommended` → "แนะนำ" (and preselected). */
export const OFFER_BADGES = ['bonus', 'recommended'] as const;
export type OfferBadge = (typeof OFFER_BADGES)[number];

/** Catalog ids are data (admin-managed), so they are strings, e.g. 'heart_ticket', 'heart_ticket_3'. */
export type CatalogProductId = string;
export type OfferId = string;

/** Features a feature_credit product can open. */
export const FEATURE_IDS = ['compat_unlock'] as const;
export type FeatureId = (typeof FEATURE_IDS)[number];

export interface ShopOffer {
  id: OfferId;
  label: string;
  /** Paid units. */
  quantity: number;
  /** Free units on top ("แถม"). */
  bonusQuantity: number;
  /** quantity + bonusQuantity: what the buyer receives. */
  units: number;
  priceMoo: number;
  badges: OfferBadge[];
}

export interface ShopProduct {
  id: CatalogProductId;
  type: ProductType;
  featureId: FeatureId | null;
  name: string;
  description: string;
  /** Frontend maps the key to an asset, e.g. 'heart-knowing' → the ตั๋วรู้ใจ visual. */
  imageKey: string | null;
  offers: ShopOffer[];
}

export interface ShopCategory {
  id: ShopCategoryId;
  name: string;
  products: ShopProduct[];
}

/** GET /api/shop: published categories, products and offers only. */
export interface ShopResponse {
  categories: ShopCategory[];
}

/** GET /api/shop/products/:productId */
export interface ShopProductResponse {
  product: ShopProduct;
}

/** POST /api/shop/purchases body. Make idempotencyKey once per confirm tap; reuse it only to retry that tap. */
export const PurchaseRequestSchema = z.object({
  offerId: z.string().min(1).max(64),
  expectedPriceMoo: z.number().int().positive(),
  idempotencyKey: z.string().uuid(),
});
export type PurchaseRequest = z.infer<typeof PurchaseRequestSchema>;

/** Where a grant came from. Promotion and gift grants may expire and are used first. */
export const GRANT_SOURCES = ['purchase', 'admin', 'promotion', 'gift'] as const;
export type GrantSource = (typeof GRANT_SOURCES)[number];

/** The reader's usable ตั๋วรู้ใจ, separate from the มู balance. */
export interface TicketsSummary {
  usesLeft: number;
  /** Grants with an expiry and units left, soonest first. Purchased tickets never appear here. */
  expiring: { uses: number; expiresAt: string; source: GrantSource }[];
}

/** POST /api/shop/purchases 200. A replay with the same key returns the same body. */
export interface PurchaseResponse {
  purchaseId: string;
  offerId: OfferId;
  priceMoo: number;
  units: number;
  balance: number;
  tickets: TicketsSummary;
}

/** Error codes the Shop and unlock routes answer with, in `{ error }`. */
export const SHOP_ERRORS = {
  productUnavailable: 'product_unavailable',
  offerUnavailable: 'offer_unavailable',
  priceChanged: 'price_changed',
  offerRequired: 'offer_required',
  packTooSmall: 'pack_too_small',
  ticketRequired: 'ticket_required',
} as const;

/** 409 when expectedPriceMoo no longer matches: show the current offer and ask again. */
export interface PriceChangedBody {
  error: typeof SHOP_ERRORS.priceChanged;
  offer: ShopOffer;
}

/** 402 from the unlock route: no usable ticket. */
export interface TicketRequiredBody {
  error: typeof SHOP_ERRORS.ticketRequired;
  balance: number;
}

export const TICKET_EVENT_KINDS = ['granted', 'used', 'restored', 'revoked', 'expired'] as const;
export type TicketEventKind = (typeof TICKET_EVENT_KINDS)[number];

/** One row of GET /api/wallet/tickets/history. Show `label` as given. */
export interface TicketHistoryEntry {
  id: string;
  kind: TicketEventKind;
  units: number;
  /** Set on `granted` rows. */
  source: GrantSource | null;
  label: string;
  /** On `used` rows: the compatibility row it opened. */
  refId: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface TicketHistoryResponse {
  entries: TicketHistoryEntry[];
  nextCursor: string | null;
}

/** What a catalog purchase row snapshots: exactly what the buyer saw and paid. */
export interface PurchaseSnapshot {
  productName: string;
  offerLabel: string;
  quantity: number;
  bonusQuantity: number;
  priceMoo: number;
}

export const PURCHASE_SOURCES = ['wallet', 'order'] as const;
export type PurchaseSource = (typeof PURCHASE_SOURCES)[number];

export const FULFILMENT_FAILURE_REASONS = ['offer_unavailable', 'price_changed', 'insufficient_balance', 'handler_error'] as const;
export type FulfilmentFailureReason = (typeof FULFILMENT_FAILURE_REASONS)[number];

export const UNLOCK_OUTCOMES = ['unlocked', 'failed', 'refused', 'already_open'] as const;
export type UnlockOutcome = (typeof UNLOCK_OUTCOMES)[number];
