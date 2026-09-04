# features/tarot

Placeholder. Tarot is registered as a disabled system in
[`src/lib/systems.ts`](../../lib/systems.ts) but has no reading logic yet.

When tarot is built, this folder holds:
- **Components** — card spread UI, draw animation, result cards (follow the
  patterns in `src/features/fusion/chart/` and `today/`).
- **Hooks** — data fetching/mutation hooks (see `src/features/fusion/hooks/`).
- **Prompts contract** — the request/response shape tarot's LLM prompt
  builder expects, mirroring how `horo-be/src/lib/prompts.ts` documents
  `buildCompatibilityPrompt`/`buildTeaserPrompt` for the backend side.

See [`docs/adding-a-system.md`](../../../docs/adding-a-system.md) for the
full recipe to bring tarot online across both repos.
