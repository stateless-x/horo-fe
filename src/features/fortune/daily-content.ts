/**
 * Pure helpers and types for daily reading payloads.
 * Kept free of React/network imports so they can be unit-tested directly.
 *
 * Payloads exist in two stored generations:
 * - v1 (no `contentVersion`): legacy rows; may carry `suggestions`, has no hook fields.
 * - v2 (`contentVersion: 2`): adds `hookLine`/`themeKey`/`focusKey`/`actionTags`,
 *   drops `suggestions`.
 * Every field that differs between versions is optional — readers must accept both.
 */
export interface StructuredDailyContent {
  contentVersion?: number;
  dailyTheme?: string;
  themeKey?: string;
  focusKey?: string;
  hookLine?: string;
  actionTags?: string[];
  overallScore?: number;
  overallReading: string;
  categories: {
    career: { reading: string; score: number; tip: string };
    love: { reading: string; score: number; tip: string };
    finance: { reading: string; score: number; tip: string };
    health: { reading: string; score: number; tip: string };
  };
  dos: string[];
  donts: string[];
  luckyMoment: string;
  luckyNumbers?: number[];
  luckyColor?: string;
  luckyDirection?: string;
  warnings?: string[];
  /** v1 only — generated but never rendered; kept so legacy rows parse. */
  suggestions?: string[];
}

/** Hard ceiling for a derived hook line (docs/claude-ui-correction-1.md §5). */
export const HOOK_LINE_MAX_CHARS = 100;

/**
 * The one-line takeaway for the hero/share card.
 * v2 payloads carry `hookLine`; v1 falls back to the first clause(s) of the
 * overall reading. The derived fallback never exceeds HOOK_LINE_MAX_CHARS,
 * including unbroken Thai text with no spaces (truncated with an ellipsis).
 */
export function getDailyHookLine(structured: StructuredDailyContent | null | undefined): string | null {
  if (!structured) return null;
  if (structured.hookLine && structured.hookLine.trim().length > 0) {
    return structured.hookLine.trim();
  }
  const reading = structured.overallReading?.trim();
  if (!reading) return null;
  // Thai prose separates clauses with spaces, not periods: accumulate
  // space-delimited segments until the line is long enough to stand alone.
  const segments = reading.split(/\s+/);
  let hook = '';
  for (const segment of segments) {
    const candidate = hook.length > 0 ? `${hook} ${segment}` : segment;
    if (hook.length >= 40 && candidate.length > HOOK_LINE_MAX_CHARS) break;
    hook = candidate;
    if (hook.length >= 40) break;
  }
  if (hook.length > HOOK_LINE_MAX_CHARS) {
    hook = `${hook.slice(0, HOOK_LINE_MAX_CHARS - 1).trimEnd()}…`;
  }
  return hook.length > 0 ? hook : null;
}
