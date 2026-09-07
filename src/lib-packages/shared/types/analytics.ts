// GENERATED from horo-be/lib/shared/types — do not edit. Run `bun run sync:types` in horo-be.
/**
 * Dashboard surfaces whose daily opens are counted.
 *
 * The single source of truth for both the API's body validation and the
 * frontend's tracking hook, so adding a surface is one edit here plus a
 * `bun run sync:types`.
 */
export const TRACKED_SURFACES = ['today', 'fortune'] as const;

export type TrackedSurface = (typeof TRACKED_SURFACES)[number];
