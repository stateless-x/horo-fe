# Compatibility result routes

Status: accepted and implemented 2026-09-28

Owner: compatibility frontend

Code authority: route files and `src/features/compatibility/compatibility-routes.ts`

## Context

Generated compatibility reports need stable URLs so a signed-in user can bookmark, revisit, and refer to one result. The previous dashboard used `/dashboard/compatibility?id=<row-id>`. A separate public surface already uses `/compatibility/[token]` for intentionally shareable, privacy-limited reports.

## Decision

- `/dashboard/compatibility` owns report creation and history.
- `/dashboard/compatibility/[id]` is the canonical authenticated URL for one full report.
- `/dashboard/compatibility?id=<id>` remains a migration path and redirects to the canonical URL, preserving `section` when present.
- `/compatibility/[token]` remains the public share route. A database row ID must not be treated as a share token.
- The backend remains the authorization boundary: `GET /api/fortune/compatibility/:id` requires a session and scopes the row to the caller's profile.

## Options considered

1. **Dashboard child route — chosen.** Keeps the full report inside the existing auth and navigation shell, avoids a public-route collision, and gives each result a durable path.
2. **Reuse `/compatibility/[token]`.** Shorter, but makes public tokens and private row IDs ambiguous and increases the chance of exposing the wrong representation.
3. **Add `/compatibility/report/[id]`.** Collision-free, but splits the signed-in product from the dashboard and duplicates route/auth responsibilities.

## Consequences

- Route files stay thin. Creation/history orchestration lives in `src/features/compatibility/compatibility-dashboard.tsx`; the bookmarkable detail route uses the smaller `src/features/compatibility/compatibility-result-page.tsx` controller and does not fetch history.
- New calculations, history rows, wallet ledger links, and developer regeneration links navigate to the canonical path.
- Old bookmarks continue to work through a server redirect.
- Direct result loads show an explicit loading state and a non-disclosing recovery state for missing or unauthorized IDs.

## Verification

Run from `horo-fe`:

```sh
npm run type-check
bun test src/features/compatibility/compatibility-routes.test.ts src/features/compatibility/compatibility-report.test.tsx src/features/wallet/wallet.test.tsx
npx eslint src/app/dashboard/compatibility/page.tsx 'src/app/dashboard/compatibility/[id]/page.tsx' src/features/compatibility/compatibility-dashboard.tsx src/features/compatibility/compatibility-result-page.tsx src/features/compatibility/compatibility-routes.ts
```

Manual acceptance:

- Open `/dashboard/compatibility?id=<owned-id>&section=people`; it redirects to `/dashboard/compatibility/<owned-id>?section=people`.
- Reload the canonical URL; the same signed-in report opens.
- Open an unknown or unowned ID; no report data appears and the user can return to the form.
- Open a public `/compatibility/<share-token>` link; it keeps the privacy-limited public experience.

## FRESH score

New doc: F 2 (descriptive path and headings; no decisions index) · R 3 (dated, status-marked, and checked against route/API code) · E 3 (compact decision record) · S 3 (one routing decision) · H 3 (exact paths, commands, and acceptance checks). Total: **14/15 (A)**.
