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
