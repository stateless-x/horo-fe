/**
 * Small text-shaping helpers shared across chart cards. Thai prose rarely
 * uses ASCII periods and separates clauses with spaces instead, so naive
 * `.`-splitting either returns the whole paragraph or cuts mid-sentence;
 * these helpers account for that.
 */

/**
 * A short preview clipped at a clause boundary rather than a hard character
 * cut. Tries an ASCII/Thai sentence terminator first (`.`, `!`, `?`, `。`);
 * if none exists, accumulates space-delimited segments up to maxChars, the
 * same clause-accumulation approach as getDailyHookLine in
 * src/features/fortune/daily-content.ts. Unbroken Thai with no spaces at all
 * falls back to a grapheme-aware truncation so the preview never renders the
 * full wall of text or cuts mid-character.
 */
export function firstClauseOrTruncate(text: string, maxChars: number = 60): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return trimmed;

  const sentenceMatch = trimmed.match(/^[^.!?。\n]+[.!?。]?/);
  if (sentenceMatch && sentenceMatch[0].trim().length <= maxChars) {
    return sentenceMatch[0].trim();
  }

  const segments = trimmed.split(/\s+/);
  if (segments.length > 1) {
    let clause = '';
    for (const segment of segments) {
      const candidate = clause.length > 0 ? `${clause} ${segment}` : segment;
      if (clause.length > 0 && candidate.length > maxChars) break;
      clause = candidate;
      if (clause.length >= maxChars) break;
    }
    if (clause.length > 0) {
      return clause.length > maxChars ? graphemeTruncate(clause, maxChars) : clause;
    }
  }

  return graphemeTruncate(trimmed, maxChars);
}

/** Truncates to at most maxGraphemes Thai graphemes, appending an ellipsis if cut. */
function graphemeTruncate(text: string, maxGraphemes: number): string {
  const graphemes = Array.from(new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(text));
  if (graphemes.length <= maxGraphemes) return text;
  return graphemes.slice(0, maxGraphemes).map((g) => g.segment).join('') + '…';
}
