---
version: 1
slug: "src-app-dashboard-compatibility-page-tsx"
status: "implemented"
last_verified: "2026-09-28"
authority: "When this brief and the implementation disagree, the implementation wins."
primary_target: "src/features/compatibility/compatibility-dashboard.tsx"
related_targets:
  - "src/app/dashboard/compatibility/page.tsx"
  - "src/app/dashboard/compatibility/[id]/page.tsx"
  - "src/features/compatibility/compatibility-result.tsx"
  - "src/features/compatibility/compatibility-report.tsx"
  - "src/features/compatibility/report/report-cover.tsx"
  - "src/features/compatibility/report/compatibility-talisman.tsx"
  - "src/features/compatibility/report/report-door.tsx"
  - "src/features/compatibility/report/share-card.tsx"
  - "src/components/ui/mu-gem-mark.tsx"
---

# Compatibility result — Compatibility Talisman

## Outcome

Make the compatibility result the product's most memorable paid-conversion surface without turning it into an exam score. Preserve the free result's real value, then make the full reading's benefits easy to understand and buy.

## Direction contract

- Visual direction: modern Thai diviner's room, light-first, romance pink as relationship payload, premium matte clay objects.
- Signature moment: one score-responsive Compatibility Talisman between the two element figures, reused on the share card; the score stays accessible HTML below it, never inside a circular badge.
- Score grammar: one premium four-band system—0–39 different rhythms, 40–59 finding rhythm, 60–79 balanced fit, 80–100 shared momentum. Every state keeps two complete, distinct, equal-status gems; only the shared orbital field progresses from an open connection to crossing paths, synchronized orbits, and a harmonic halo.
- Information order: cover → four free dimensions → compact paid value summary → three personal questions → secondary actions.
- Locked offer: four benefit groups only; detailed chapter contents appear after unlock.
- Visual density: reserve cards for the cover, purchase door and interactive report modules. Scores and questions use hairline lists; explain the lock once per section instead of decorating every row.
- Section cues: the opened report uses one small transparent clay asset beside each focused section heading, replacing redundant tab numbering and decorative UI chrome. The assets are contextual, text-free and never carry state or essential information.
- Progressive reading: collapsed chapters show title, summary and one practical action. Pull quotes, long text and specialist detail stay behind “รายละเอียด”.
- Focused full report: after unlock, every viewport shows one of four sections at a time—เคมีของเรา, ใจเขา ใจเรา, คุยให้ถึงใจ, ไปต่อยังไงดี (the unit is ส่วน, never a numbered บท)—with previous/next controls.
- URL behavior: each signed-in result has the canonical path `/dashboard/compatibility/[id]`; the selected full-report section lives in `?section=`, and browser Back/Forward restores the section naturally. Legacy `?id=` links redirect to this path.
- Responsive behavior: locked desktop aligns a 680px cover/content column and sticky offer rail inside one 1080px shell. The opened report uses one 720px reading column; phones compose the four tabs as 2×2, while iPad and desktop use one row.
- Thai readability: below 640px the talisman occupies its own row and both people get equal-width columns beneath it. Names remain single-line; secondary MBTI and day-master metadata appears from 640px upward.
- Reusable brand asset: a text-free faceted `MuGemMark` for unlock and wallet contexts.

## Product guardrails

- Never punish or shame a low-scoring pair through damage, heartbreak imagery, dullness, or cheaper art.
- Keep celestial symbolism abstract; no crown, royal regalia, vajra, yantra, lotus pedestal, or other sacred object.
- Do not hide the four dimension scores behind payment.
- Keep all names, birth data, and generated prose out of analytics.
- Show monetary parity whenever spending wallet units: 49 มู (฿49).
- Preserve 44px touch targets, visible focus, reduced motion, semantic headings, and readable Thai line lengths.

## Acceptance

- No circular score badge or text ring remains on the cover or share card; the numeric score is HTML.
- All four score bands resolve to distinct premium clay art and calm range copy; every band retains two intact, independent gems.
- The locked result has no repeated per-chapter lock rows.
- Dimension and question sections are flat lists rather than nested cards, and repeated history/back-link copy is removed.
- The locked desktop cover and sticky offer rail share the 1080px shell; tablet and mobile stay one column.
- The opened report never renders all chapters at once: exactly one of the four focused sections is visible on mobile, iPad and desktop.
- The focused-section header has one context-specific, text-free clay asset; tabs remain plain language and do not depend on images to be understood.
- Switching sections updates `?section=` without leaving the canonical result path, and keyboard arrows, Home and End move between the tabs.
- Desktop, iPad, and mobile screenshots show no clipping, overlap, or horizontal scroll.
- Thai names do not split into isolated syllables at 320px, and the score, archetype and verdict retain clear reading order.
- Teaser and full report tests, type-check, lint, and the Impeccable detector pass or have explicit findings.

## Documentation health

FRESH before → after: F 2→2 (target-keyed filename, frontmatter and headings; no project docs
index) · R 3→3 (re-verified the named targets and replaced the superseded `?id=` contract with
the canonical result path) · E 3→3 · S 3→3 · H 3→3 (added exact route ownership and migration
behavior). Total: 14/15 (A) → 14/15 (A).
