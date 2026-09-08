export type ResultOpenGuard = { current: boolean };

/** Reports a mounted result once, including when React replays mount effects. */
export function trackMountedResultOnce(guard: ResultOpenGuard, onResultOpen: () => void): void {
  if (guard.current) return;
  guard.current = true;
  onResultOpen();
}
