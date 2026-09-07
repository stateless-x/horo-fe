# horo-fe

The web app for สายมู, a Thai fortune-telling product. People arrive knowing
their birth date and leave with a reading: their element, their four pillars,
what today looks like, and how they match with someone else.

Part of the [horo](https://github.com/stateless-x/horo) system. It talks to
[horo-be](https://github.com/stateless-x/horo-be) over HTTP and holds no
database connection or model API key of its own.

## Stack

Next.js 15 (App Router) · React 19 · Tailwind v4 · Framer Motion · Zustand ·
TanStack Query · Better Auth · Bun.

## Setup

```bash
bun install
cp .env.example .env.local   # then fill it in
bun run dev                  # http://localhost:3000
```

Start horo-be first on port 3001. Without it the app loads but every reading
fails, because all astrology and generation happens server side.

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_API_URL` | Where horo-be lives. `http://localhost:3001` in development |
| `BETTER_AUTH_SECRET` | Session signing secret. Must match horo-be |
| `BETTER_AUTH_URL` | This app's own origin |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign in |
| `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` | X sign in |

## The routes that matter

`/fortune` is the onboarding flow and the most delicate part of the product.
Seven steps collect a name, birth date, gender, birth time and optional MBTI,
then show a short teaser reading before asking anyone to sign up. Value comes
first, the account second. Everything about that order is deliberate.

`/dashboard/today` is the daily reading and the surface people return to.
`/dashboard/fortune` is the full birth chart. `/dashboard/compatibility` scores
two people against each other. `/login` and the marketing pages sit at the root.

## Two things to know before editing

**The voice.** Readings and interface copy address the reader as คุณ, in warm,
natural Thai, with no scare tactics and no pressure to sign up. An older version
used the archaic เจ้า and ข้า; that was deliberately removed. Do not reintroduce
it.

**The design system.** `DESIGN.md` at the repository root is authoritative for
colour, type, spacing and motion. It names the element colours, the MBTI group
hues, and the rules for using them. Read it before adding a colour.

## Shared types

`src/lib-packages/shared` is generated. Its source lives in
`horo-be/lib/shared/types` and it is copied here by `bun run sync:types` in
horo-be. Edits made here are lost on the next sync.

## Commands

```bash
bun run dev          # development server
bun run build        # production build
bun run type-check   # tsc --noEmit
```

There is no ESLint configuration in this repository, so `bun run lint` fails.
Type checking is the gate that matters.

## Deployment

Railway builds and deploys on push to `master`.
