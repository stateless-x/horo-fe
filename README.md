# horo-fe

The web app for สายมู. Someone arrives knowing only their birth date and
leaves with a reading: their element, their four pillars, what today holds, and
how they match with someone else.

Part of the [horo](https://github.com/stateless-x/horo) system. It speaks only
to [horo-be](https://github.com/stateless-x/horo-be) over HTTP, and holds no
database connection and no model key of its own.

Next.js 15 (App Router) · React 19 · Tailwind v4 · Framer Motion · Zustand ·
TanStack Query · Better Auth · Bun.

## Setup

```bash
bun install
cp .env.example .env.local   # then fill it in
bun run dev                  # http://localhost:3000
```

Start horo-be on port 3001 first. Without it the app loads and every reading
fails, because all the astrology and generation happens server side.

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_API_URL` | Where horo-be lives. `http://localhost:3001` in development |
| `BETTER_AUTH_SECRET` | Session signing secret. Must match horo-be |
| `BETTER_AUTH_URL` | This app's own origin |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign in |
| `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` | X sign in |

## The routes that matter

`/fortune` is onboarding, and the most delicate thing in the product. Seven
steps collect a name, birth date, gender, birth time and optional MBTI, then
show a short teaser reading before anyone is asked to sign up. Value first,
account second. That order is deliberate, and it is what the whole funnel rests
on.

`/dashboard/today` is the daily reading and the reason people come back.
`/dashboard/fortune` is the full birth chart, `/dashboard/compatibility` scores
two people against each other, and the marketing pages sit at the root.

**Everything that authenticates lands on `/dashboard/today`.** Sign-up through
onboarding, sign-in at `/login`, and bare `/dashboard` all resolve there. Those
four call sites — `components/onboarding/step-auth.tsx` (both providers),
`app/login/page.tsx`, and `app/dashboard/page.tsx` — have to agree; onboarding
used to send new users to `/dashboard/fortune` instead, which split new arrivals
away from the surface built to bring them back.

## Before you edit

**The voice is คุณ.** Readings and interface copy speak warm, natural Thai,
with no scare tactics and no pressure to sign up. An earlier version used the
archaic เจ้า and ข้า, and that was removed on purpose. Do not bring it back.

**DESIGN.md decides the visuals.** It sits at the repository root and is
authoritative for colour, type, spacing and motion, including the element
colours and the MBTI group hues. Read it before you invent a colour.

**`src/lib-packages/shared` is generated.** Its source is
`horo-be/lib/shared/types`, copied here by `bun run sync:types` run from
horo-be. Edits made here vanish at the next sync.

**A cold reading is bounded by the socket, not by patience.** Bun caps
`idleTimeout` at 255s (`horo-be/src/lib/http-server-options.ts`), so every
generation budget on both sides has to fit under that ceiling: the backend runs
its retry ladder inside one request, and the client simply waits slightly past
255s and lets the server be the thing that gives up. Two rules follow. Do not
raise a client timeout past the ceiling — the socket closes first, so a bigger
number only buys a longer wait before the same failure. And do not add client
retries on top: the backend already retries internally, so a client retry
re-runs a whole cold generation rather than recovering from a blip, and they
multiply into many minutes of loader with no error shown. A first-time cold
generation still takes one to two minutes; that is DeepSeek's speed, not a bug.

## Commands

```bash
bun run dev          # development server
bun run build        # production build
bun run type-check   # tsc --noEmit
```

This repository has no ESLint configuration, so `bun run lint` fails. Type
checking is the gate that matters.

Railway builds and deploys on push to `master`.
