# Horo frontend visual and loading-state plan

Status: implemented on 2026-10-02  
Audited: 2026-10-02 against the current `horo-fe` working tree  
Authority: implementation wins if this plan and code later disagree.

## Outcome and evidence

Make สายมู feel like one product from landing page through onboarding, waiting, and reading: clear next actions, calm surfaces, and honest progress without extra visual noise. Preserve the current light-first purple and clay identity in `PRODUCT.md` and `DESIGN.md`.

Evidence: source inspection plus local browser review of the landing page at desktop and 390px mobile, `/fortune`, `/login`, and the temporary loader preview in light mode before it was removed. Signed-in dashboard screens were reviewed in code only because local authenticated data was unavailable. No analytics, user research, Figma file, or brand-change request was supplied; impact and preferences below are hypotheses to validate.

## Audit findings

| Priority | Finding and evidence | User effect |
| --- | --- | --- |
| P1 | `/fortune` and `/login` briefly show bare centered `กำลังโหลด...` on an empty page (`src/app/fortune/page.tsx`, `src/app/login/page.tsx`). Settings, invite, shop, and wallet also use plain-text loading states. | The polished landing experience abruptly loses its visual and status language. |
| P1 | Long waits use `MainLoader` but compose it differently: fortune has rotating copy, hint, and timeout controls; compatibility adds particles, a seconds counter, three animated dots, and explanatory text (`src/features/fortune/loading-skeleton.tsx`, `src/features/compatibility/compatibility-loading.tsx`). | Related tasks feel like different products; multiple moving signals compete with the real status. |
| P1 | `LoadingLine` can replace the status sentence with a sponsored card; `useMinLoading` deliberately holds a cached result for 3 seconds so the card is seen (`src/components/ui/loading-line.tsx`, `src/hooks/use-min-loading.ts`). This was confirmed in the temporary loader preview before its removal. | Progress becomes unclear, and a fast result can feel artificially slow. Sponsorship behavior needs a product decision. |
| P2 | Hero presents a full-size login action beside the free-reading action, while login is also in the desktop header (`src/components/landing/landing-narrative.tsx`, `src/components/layout/public-nav.tsx`). Mobile stacks both large actions. | The intended first step has less emphasis than it could. |
| P2 | Six reading-category cards use hover and lift styling but are informational, while the copy invites choosing a topic (`src/components/landing/reading-categories.tsx`). | Visitors may expect a click that does not exist. |
| P2 | The landing page puts a closing CTA before a detailed three-systems explainer (`src/components/landing/landing-narrative.tsx`). | The narrative appears to end, then starts again. |
| P2 | The middle of the landing page stacks five element cards, six category cards, one proof card, and three system cards (`src/components/landing/element-showcase.tsx`, `src/components/landing/reading-categories.tsx`, `src/components/landing/landing-narrative.tsx`). | Repeated pale tiles make distinct ideas feel equivalent and lengthen the path to the final action. |
| P2 | Core landing sections animate from invisible on entry, and compatibility particles/dots continue moving without a reduced-motion branch. | Fast scrolling can reveal a blank band; waiting feels busier than the reading experience. |
| P2, verify | The collapsed mobile navigation remains mounted with focusable descendants under `aria-hidden` (`src/components/layout/public-nav.tsx`, `src/components/layout/app-header.tsx`). Source inspection suggests hidden keyboard stops; this still needs an interaction check. | Keyboard users may tab into invisible menu items. |
| P3 | The source detector flagged tiny calendar labels and two gradient-text usages; these are review targets, not confirmed defects. | Potential small-screen readability and contrast cost. |

The existing token palette, Thai type pairing, clay imagery, and light/dark modes are coherent. Retain them. The chart/compatibility reports have intentionally denser information than the landing page; do not flatten meaningful reading content into a generic template.

## Design direction: one waiting grammar, three scales

**Recommended: shared behavior and hierarchy with scale by wait length.**

| Wait | UI contract | Typical use |
| --- | --- | --- |
| Brief action or list refresh | Keep the current page visible; show a small inline spinner or button pending state with an accessible label. | Pagination, purchasing, save action, wallet history. |
| Page navigation or uncertain fetch | Keep page chrome and expected content shape stable; use a restrained page placeholder or small brand mark, one explicit status line. Do not flash a full mascot for a subsecond wait. | Login/session check, shop, wallet, settings, invite. |
| Generation taking several seconds | Use a shared centered loading shell with the Little Oracle, one persistent task-specific status line, and at most one quiet expectation/reassurance line. Add recovery only after the real timeout. | Daily/monthly reading, compatibility generation, teaser. |

Keep an honest status visible if sponsored content is retained. Put sponsorship in a separate secondary area only if the product decision keeps it; never replace progress or delay already-ready content solely to show it. Preserve the current backend-aligned timeout rules and error recovery. Give `prefers-reduced-motion` a static version of every ornamental animation, including particles and entrance transitions.

### Alternatives considered

1. **One large mascot loader everywhere:** strongest visual repetition, but slow-feeling for quick transitions and poor fit for buttons/list updates.
2. **Recommended three-scale system:** one visual and copy grammar while matching the size of the wait. Needs a shared shell and a route-by-route migration.
3. **Keep current loaders and restyle them individually:** fastest per screen, but leaves behavior and accessibility inconsistent.

Choose option 2 because the site already has `MainLoader` and distinct short versus long waits; the change can reuse both rather than adding another visual identity.

## Mergeable implementation plan

| Step | Change | Acceptance and verification | Rollback |
| --- | --- | --- | --- |
| 1. Loading contract | Define shared `PageLoadingState` and `GenerationLoadingState` around existing `MainLoader`; establish stable status, optional hint, timeout/retry, and reduced-motion behavior. Do not put a large mascot on brief fetches. | Component checks for status semantics and timeout/retry; inspect light/dark, 390px and desktop, reduced motion. | Revert new wrappers; existing loaders remain callable. |
| 2. First-paint consistency | Replace bare full-page text in `/fortune`, `/login`, invite, settings; give shop/wallet pending data a stable header/content shape. Keep navigation and page height from jumping. | Browser check each route during throttled session/API response; no blank page, duplicate announcement, or layout jump. | Revert per-route changes independently. |
| 3. Long-wait simplification | Migrate daily/monthly, teaser, and compatibility into the shared generation shell. Remove compatibility particles, bouncing dots, and live seconds display unless research shows they help. Keep one true status and one delayed reassurance. | Browser screenshots at short, 30s, and timeout states; unit/integration checks for timeout and retry; screen reader and reduced-motion pass. | Revert one flow at a time; preserve its existing request logic. |
| 4. Sponsorship decision | Decide whether sponsorship belongs on loading screens. If retained, move it below the stable status and remove the 3s floor for already-ready results; confirm with business metrics. | Compare wait-to-content timing and sponsor impressions before/after; status never disappears. | Restore previous placement/timing independently of loader styling. |
| 5. Landing clarity | Keep one dominant “เริ่มดูดวงฟรี” action; make login a quiet link, clarify category cards as links or static previews, and place the detailed explainer before the final CTA or shorten it. Compress the five elements into a lighter strip, keep one substantive proof sample, and make the three-system block concise so each section has a distinct role. | Desktop/mobile click-path review: visitor can state the next step; no misleading hover affordance or repeated card rhythm; SEO content remains crawlable. | Revert individual landing sections. |
| 6. Accessibility and polish | Verify collapsed mobile menus with keyboard; fix hidden focus if reproduced. Audit 320–390px labels, light/dark contrast, focus, reduced motion, and entrance effects. | Keyboard walkthrough, zoom/text growth, mobile and desktop screenshots; run project lint/type-check and targeted tests after code changes. | Revert each focused fix. |

Build each step against the current working tree and preserve unrelated shop/wallet/compatibility edits. No production files were changed by this audit.

## Scope checkpoint

Recommended first release: steps 1–3 and the decision in step 4. This addresses the visible loading mismatch before broader landing polish. Steps 5–6 can follow as separate reviewable changes. Do not alter payment logic, reading content, backend generation, astrology color meanings, or the approved report structure as part of visual cleanup.

Resolved decisions: loading screens no longer show sponsored content or impose an artificial wait; category cards are now clearly informational previews until a real topic destination exists.

## Implementation record

- Added shared `PageLoadingState` and `GenerationLoadingState` components. Route, session, shop, wallet, settings, fortune, and compatibility entry waits now use the compact or long-wait state appropriate to their duration.
- Removed rotating sponsored loading content, its client query, and the minimum-loading hook. Daily, monthly, and compatibility results render immediately after their data is ready.
- Simplified fortune and compatibility generation to one mascot, one stable task status, one optional expectation, and the existing timeout recovery. The compatibility timer, particles, and animated dots are gone.
- Reduced landing repetition with a compact element strip and non-interactive category previews; moved the system explainer ahead of the final CTA; changed hero login to a supporting text link.
- Made collapsed mobile navigation inert, preventing keyboard focus from entering invisible drawer controls.
- Made all landing scroll-in sections static for reduced-motion users, while the loader already switches to its static poster in that preference.
- Removed the temporary loader preview and the now-unused loading-lines endpoint, cache route, tests, and shared response types.
- Verified the public landing, loading, login, and collapsed/expanded mobile navigation states in the local browser. Authenticated dashboard routes use the same shared state and passed source/type validation; production data verification remains a release check.

Not included: the calendar label review remains a separate low-priority readability pass.

## Documentation health

FRESH before → after: F 2→2 (descriptive filename/headings, no index entry) · R 3→3 (implementation record names current code changes and the remaining calendar work) · E 2→2 (the delivery table remains separately retrievable) · S 3→3 (one audit and implementation-plan purpose) · H 3→3 (paths, boundaries, acceptance, and rollback remain present). Total: 13/15 (A) → 13/15 (A).
