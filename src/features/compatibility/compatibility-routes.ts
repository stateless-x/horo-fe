import { RelationshipTypeSchema, type RelationshipType } from '@/lib-packages/shared';

export const COMPATIBILITY_DASHBOARD_PATH = '/dashboard/compatibility';

export const compatibilityResultOriginKey = (id: string) =>
  ['compatibility', 'result-origin', id] as const;

export function compatibilityResultFailureKind(error: unknown): 'unavailable' | 'transient' {
  const status = typeof error === 'object' && error !== null && 'status' in error
    ? (error as { status?: unknown }).status
    : undefined;
  return status === 403 || status === 404 ? 'unavailable' : 'transient';
}

export function compatibilityResultPath(id: string, section?: string): string {
  const path = `${COMPATIBILITY_DASHBOARD_PATH}/${encodeURIComponent(id)}`;
  if (!section) return path;

  const search = new URLSearchParams({ section });
  return `${path}?${search.toString()}`;
}

export const COMPATIBILITY_HISTORY_PATH = `${COMPATIBILITY_DASHBOARD_PATH}/history`;

/** The full history list; page 1 and "every type" stay out of the URL so the bare path is canonical. */
export function compatibilityHistoryPath({ page = 1, type }: { page?: number; type?: RelationshipType } = {}): string {
  const search = new URLSearchParams();
  if (type) search.set('type', type);
  if (page > 1) search.set('page', String(page));
  const query = search.toString();
  return query ? `${COMPATIBILITY_HISTORY_PATH}?${query}` : COMPATIBILITY_HISTORY_PATH;
}

/** `?page=`: a positive whole number, else page 1. */
export function parseHistoryPage(raw: string | undefined): number {
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** `?type=`: one of the relationship types, else no filter. */
export function parseHistoryType(raw: string | undefined): RelationshipType | undefined {
  const parsed = RelationshipTypeSchema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}
