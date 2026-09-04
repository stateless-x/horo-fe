# Adding a fortune-telling system (tarot, shop-adjacent readings, …)

A "system" is a full product feature (Bazi/fortune, compatibility, tarot),
not just a public page — see [`adding-a-section.md`](./adding-a-section.md)
for marketing-only sections. Adding a system touches both repos:

1. **Shared types** — add the new system's request/response types to
   `horo-be/lib/shared/types/`, then run `bun run sync:types` from
   `horo-be` to copy them into `horo-fe/src/lib-packages/shared/types/`.
   Never hand-edit the frontend copies (see `horo-be/docs/shared-types.md`).
2. **Backend routes** — create `horo-be/src/systems/<id>/routes.ts`
   exporting an `Elysia` instance, then add it to the `.use(...)` chain in
   `horo-be/src/systems/index.ts`. Reading endpoints use
   `prefix: '/api/fortune'` (byte-stable URL convention — see
   `horo-be/docs/architecture.md`); a status/metadata-only endpoint (like the
   tarot skeleton's `/api/tarot/status`) may use its own prefix instead.
3. **Frontend feature + registry**
   - Build feature code under `src/features/<id>/` (components, hooks,
     prompts contract — not `src/components/`).
   - Add an entry to `SYSTEMS` in [`src/lib/systems.ts`](../src/lib/systems.ts)
     with `id`, `enabled`, `dashboardRoute`, and `dashboardTabs`. The
     app header (`app-header.tsx`) renders enabled systems'
     tabs from this registry — nothing else to touch.
   - Add the dashboard route(s) under `src/app/dashboard/<id>/`.
4. **Marketing section** — if the system also needs a public-facing page
   (e.g. a `/tarot` landing page), follow
   [`adding-a-section.md`](./adding-a-section.md) to register it in
   `SITE_SECTIONS`.
5. **Design** — new surfaces must follow `DESIGN.md` at the repo root:
   stay on the purple ladder (element hues are user-data payloads only, never
   decoration), illustrative imagery is clay-cast renders on the purple
   ladder (`MediaPlaceholder` until real assets land), and copy follows the
   Two Voices rule (คุณ on marketing, เจ้า/ข้า inside the reading experience).

## Worked example

The tarot skeleton in this codebase exercises every step above except step 4
(no public page yet) while being fully disabled — nothing a user sees
changes:
- `horo-be/src/systems/tarot/routes.ts` — one endpoint, `GET /api/tarot/status`.
- `horo-be/src/systems/index.ts` — registers `tarotRoutes`.
- `src/lib/systems.ts` — `tarot` entry with `enabled: false`.
- `src/features/tarot/README.md` — placeholder for future feature code.

To turn it on: build the feature code, add its dashboard route(s), flip
`enabled: true` and fill in `dashboardTabs` in `src/lib/systems.ts`.
