# CODEMAP — horo-fe · customer web app and onboarding client
Updated: 2026-09-14 · commit `470a7c7` + working tree · Score: **11/12** (ready for scoped fixes; map the reading domain before large work) [V]

## TL;DR
Next.js app for discovery, onboarding, authenticated readings, and compatibility; browsers call horo-be over credentialed HTTP. [V] `src/lib/api.ts:104-176`
Before rendering any dashboard page, the shared layout gate proves a server birth profile exists or sends the user to setup. [V] `src/app/dashboard/layout.tsx:45`, `src/components/dashboard/dashboard-profile-gate.tsx:34-135`
Google and X drafts are provider/user-bound; do not reintroduce an unscoped profile fallback. [V] `src/lib/profile-utils.ts:30-105`

## Scores
Purpose 2 · Spine 2 · Domain 1 · Data 2 · Boundaries 2 · Danger 2 [V]
The auth/profile domain is verified; reading generation and public content were outside this recon. [V]

## Stack & entry points
- Next.js 15 App Router, React 19, Tailwind v4, Zustand, TanStack Query, Better Auth client, Bun. [V] `package.json:1-43`
- Run `bun run dev`; verify with `bun test`, `bun run type-check`, and `bun run build`. [V] `package.json:5-12`
- Tracked tests: 93 passed; 11 new provider/draft and resume-step tests also passed, and type-check/build passed on 2026-09-14. [V]
- Route entry points live under `src/app`; authenticated pages share `src/app/dashboard/layout.tsx:45`. [V]

## Spine
1. `/login` starts Google or X OAuth and preserves a safe return path. [V] `src/app/login/page.tsx:22-58`
2. Better Auth returns a credentialed browser session from horo-be. [V] `src/lib/auth-client.ts:18-30`
3. Every dashboard route mounts `DashboardProfileGate`. [V] `src/app/dashboard/layout.tsx:45`
4. The gate claims only the returned user/provider's OAuth draft and asks the API for a profile. [V] `src/components/dashboard/dashboard-profile-gate.tsx:45-72`
5. Recovery renders the dashboard for a server profile, saves a complete matching draft, or routes incomplete users to setup. [V] `src/lib/dashboard-profile-recovery.ts:25-52`
6. Partial matching drafts resume at the first missing required field; mismatched browser state is reset. [V] `src/components/dashboard/dashboard-profile-gate.tsx:88-105`
7. Saving succeeds before the browser draft and signup source are cleared. [V] `src/components/dashboard/dashboard-profile-gate.tsx:67-78`

## Wiring
- `app/login` -> Better Auth social sign-in — provider and callback URL. [V] `src/app/login/page.tsx:37-58`
- `step-auth` -> sessionStorage — provider-bound pre-auth profile envelope. [V] `src/components/onboarding/step-auth.tsx:42-81`
- `dashboard/layout` -> profile gate — blocks all protected content. [V] `src/app/dashboard/layout.tsx:45`
- profile gate -> horo-be — `GET /api/fortune/user-profile`, then optional `POST /api/fortune/profile`. [V] `src/components/dashboard/dashboard-profile-gate.tsx:63-72`
- API client -> horo-be — cookies included cross-origin. [V] `src/lib/api.ts:104-176`

## Domain core
- Required profile fields are name, birth date, and gender; birth time and MBTI remain optional. [V] `src/lib/profile-utils.ts:19-24`, `src/lib-packages/shared/types/user.ts:14-22`
- Server profile wins over browser state; browser data is recovery input only when the server has no profile. [V] `src/lib/dashboard-profile-recovery.ts:32-48`
- OAuth drafts start bound to the selected provider and are then claimed by one returned user ID. [V] `src/lib/profile-utils.ts:30-53`
- Legacy raw or cross-account drafts are rejected and removed. [V] `src/lib/profile-utils.ts:56-78`
- Onboarding Zustand data expires after 15 minutes. [V] `src/stores/onboarding.ts:53-54,138-146`

## Data
- Persistent customer and reading data lives only in horo-be/PostgreSQL. [V] `src/lib/api.ts:104-176`
- `horo-onboarding-storage` holds a 15-minute local draft; `horo-pending-profile` survives one OAuth redirect in sessionStorage. [V] `src/stores/onboarding.ts:138-146`, `src/lib/profile-utils.ts:10-17`
- Shared request/response schemas are generated into `src/lib-packages/shared`; horo-be is their source. [V] `README.md:62-64`

## Boundaries
- Public/onboarding routes are App Router pages; dashboard protection is client-side session plus server API verification. [V] `src/app/dashboard/layout.tsx:45`, `src/components/dashboard/dashboard-profile-gate.tsx:34-135`
- OAuth and session APIs are owned by horo-be at `/api/auth`. [V] `src/lib/auth-client.ts:18-26`
- Internal return paths are sanitized before redirects. [V] `src/app/login/page.tsx:25-35`

## Danger zones
- medium · Deployment order: backend migration/auth fields must land before this client relies on `authProvider`. [V] `src/lib/auth-client.ts:50-57`, `src/components/dashboard/dashboard-profile-gate.tsx:50-53`
- Secrets sweep: no key signatures or private keys found; only `.env.example` is tracked. [V]
- Sink sweep: JSON-LD uses `JSON.stringify` inside `dangerouslySetInnerHTML`; no arbitrary HTML assignment found. [V] `src/components/seo/ai-reference.tsx:160`
- Boundary sweep: dashboard gate and API session checks located; no client page is treated as the server authorization boundary. [V]
- Dependencies: [?] external advisory audit unavailable in this offline recon; lockfile was not modified.
- Bug magnets: no TODO/FIXME/HACK hits or empty catches found by the standard sweep. [V]

## Docs verdict
- `README.md` — PARTIAL before this update: route destinations were right, profile gate/provider invariants absent. [V]
- `DEPLOYMENT.md` — PARTIAL: OAuth variables/callbacks match code; backend-first schema coupling was absent. [V]
- `PRODUCT.md` — TRUST for product scope; it does not claim implementation detail. [V]

## Drift
- Requirement: Google and X are separate accounts even with the same email. [V] user-confirmed 2026-09-13
- Code now binds both server identity and browser draft to provider/user; older docs described OAuth only as two buttons. [V] `src/lib/profile-utils.ts:30-105`

## Open questions
- [?] Full reading/compatibility domain map costs about 20 minutes when the next change touches generation.
- [?] Browser-level OAuth E2E remains unautomated; staging verification costs about 10 minutes plus provider login access.
