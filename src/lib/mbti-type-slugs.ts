/**
 * The 16 type slugs, in the same order as the hub's 16-row table.
 *
 * Its own module on purpose: src/lib/mbti-types.ts holds the full type
 * content and topic-pages.ts holds the hub, and having either import the
 * other creates a cycle. Both import this instead.
 *
 * Order is load-bearing — topic-pages.ts maps it index-by-index onto the
 * table rows, so it must stay ISTJ-first and match that table exactly.
 */
export const MBTI_TYPE_SLUGS = [
  'istj', 'isfj', 'infj', 'intj',
  'istp', 'isfp', 'infp', 'intp',
  'estp', 'esfp', 'enfp', 'entp',
  'estj', 'esfj', 'enfj', 'entj',
] as const;
