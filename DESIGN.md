---
name: สายมู
description: ดูดวงออนไลน์ที่เข้าใจตัวตน — โหราศาสตร์ไทย × ดวงจีนปาจื้อ × จิตวิทยา MBTI
colors:
  ground: "#0A0A0F"
  surface: "#0F0A1A"
  surface-2: "#1A0A2E"
  overlay: "#18181B"
  ink: "#F5F5F5"
  ink-muted: "#A1A1AA"
  accent: "#6B21A8"
  accent-bright: "#A855F7"
  accent-soft: "#C084FC"
  accent-faint: "#E9D5FF"
  accent-ink: "#F5F5F5"
  element-earth: "#D4A843"
  element-fire: "#E85D3A"
  element-water: "#4A90D9"
  element-wood: "#5BA55B"
  element-metal: "#C0C0C0"
typography:
  display:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "clamp(1.875rem, 3vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  oracle:
    fontFamily: "Sarabun, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 300
    lineHeight: 1.8
  english:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.05em"
rounded:
  md: "8px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.md}"
    padding: "16px 40px"
  button-primary-hover:
    backgroundColor: "{colors.accent-bright}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.accent-bright}"
    rounded: "{rounded.md}"
    padding: "16px 40px"
  card-glass:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.xl}"
    padding: "24px 32px"
---

# Design System: สายมู

## Overview

**Creative North Star: "ห้องดูดวงของหมอดูรุ่นใหม่" (The Modern Diviner's Room)**

สายมู is a contemporary Thai fortune-teller's studio rendered as a website: velvet
darkness, a single neon-amethyst light source, and a film-grain haze that makes every
surface feel like night air. The room is mystical but never dusty — the หมอดู here
reads Bazi charts next to an MBTI report, and the interface carries that fusion:
ancient subject matter, modern typographic precision, playful Gen-Z energy in the
shareable moments.

Density is low and theatrical on marketing surfaces (one idea per viewport, generous
dark space), and calm and legible inside the app (readings are long-form Thai text
that must breathe). Motion is ambient — floating dust-mote particles, a slow glow
pulse — never busy.

**Key Characteristics:**
- Single-hue brand: everything purple, from void to orchid; other hues are reserved payloads
- Film grain (3% opacity) over every page — the room's atmosphere
- Glassmorphic cards floating on darkness, edged with `white/10`
- Two voices: contemporary Thai (คุณ) for marketing, the oracle's เจ้า/ข้า in Sarabun Light inside readings
- Two moods, one room: white + purple daylight mode is the default; the Midnight Room (dark) is one toggle away. Only the landing hero band stays pinned dark (dark video art) via a `data-theme="dark"` wrapper

## Colors

Colors are **semantic tokens** (`ground / surface / surface2 / overlay / ink /
ink-muted / accent / accent-bright / accent-soft / accent-faint / edge`),
defined per theme as CSS variables in `globals.css` and exposed as Tailwind
utilities (`bg-ground`, `text-ink`, `border-edge`, ...). Never hardcode a
palette hex in a component. Light (white + purple) is the default theme;
the frontmatter lists the dark Midnight Room values, which remain the brand's
cinematic home (hero, wizard, and the dark toggle):

| role | dark (Midnight Room) | light (daylight) |
|---|---|---|
| ground | #0A0A0F | #FAF9FD |
| surface | #0F0A1A | #FFFFFF |
| surface2 | #1A0A2E | #F3F0FA |
| overlay | #18181B | #EFECF7 |
| ink | #F5F5F5 | #1C1226 |
| ink-muted | #A1A1AA | #645D78 |
| accent | #6B21A8 | #6B21A8 |
| accent-bright | #A855F7 | #7C3AED |
| accent-soft | #C084FC | #6D28D9 |
| accent-faint | #E9D5FF | #3B2A55 |
| accent-ink | #F5F5F5 | #F5F5F5 (text on accent fills, both modes) |
| edge | white 10% | ink 10% |

Element hues also flip for text (`--el-*` vars; e.g. metal #C0C0C0 → #6E7480
on light); fills and glows keep the ELEMENT_COLORS values.

### Primary
- **Royal Purple** (#6B21A8): the action color — primary buttons, active states, CTA glow. Rest state only; it always brightens on interaction.
- **Amethyst** (#A855F7): hover/active brightening of Royal Purple; icon tint; link color.
- **Lavender Glow** (#C084FC): emphasized inline text, headings' gradient endpoint, small highlights.
- **Pale Orchid** (#E9D5FF): hero subheads and large soft text on dark ground.

### Neutral
- **Void Black** (#0A0A0F): the page ground. Never pure #000.
- **Deep Night** (#0F0A1A): card and panel background.
- **Dark Purple** (#1A0A2E): secondary surfaces, borders at 50% opacity.
- **Charcoal** (#18181B): overlay chrome (progress pill, toasts).
- **Ghost White** (#F5F5F5): primary text. Never pure #FFF.
- **Ash Gray** (#A1A1AA): secondary text, captions, footers.

### Tertiary — the five elements
- **Earth** (#D4A843), **Fire** (#E85D3A), **Water** (#4A90D9), **Wood** (#5BA55B), **Metal** (#C0C0C0): each pairs with a 15%-alpha glow of itself.

**The Amethyst Voice Rule.** Purple is the only brand hue. The five element colors
appear exclusively when representing a user's ธาตุ (element profile, daily element,
star fills, element-themed share cards) — never as generic decoration, never in
marketing chrome. A future section (tarot, shop) extends the purple ladder; it does
not introduce a new brand hue.

One further payload hue is reserved: **Romance Pink** (#E85D75, and Tailwind's pink
ramp) marks love/relationship content only — the love category on daily readings,
the compatibility (ดวงคู่) surfaces, and their CTAs. Fills and glows may stay fixed
pink; pink TEXT must be theme-legible (`text-pink-600 dark:text-pink-400`).

**The Grain Rule.** The 3% film-grain overlay is global and non-negotiable. New
full-screen surfaces inherit it automatically via `body::before`; never stack a
second grain layer.

## Typography

**Display/Heading Font:** Anuphan (with sans-serif fallback)
**Body Font:** Noto Sans Thai (with sans-serif fallback)
**Oracle Font:** Sarabun Light 200–300 (with sans-serif fallback)
**Latin Accent Font:** Space Grotesk — English words inside Thai UI (MBTI, Bazi)
**Mono Font:** JetBrains Mono — version tags, data labels

**Character:** Anuphan's clean, softly rounded forms give headings a distinctly current Thai voice — modern without shouting, friendly enough to sit beside clay-render imagery;
Noto Sans Thai keeps long readings effortless; Sarabun at weight 200–300 is the
oracle whispering — airy, thin, otherworldly.

### Hierarchy
- **Display** (700, clamp(2.25rem→4.5rem), 1.15): hero headline only, gradient-filled ghostWhite→paleOrchid→lavenderGlow.
- **Headline** (600, clamp(1.875rem→2.5rem), 1.25): section headings.
- **Title** (600, 1.25rem, 1.4): card titles in Amethyst.
- **Body** (400, 1rem, 1.75): all running Thai text; keep ≤ 68ch.
- **Oracle** (300, 1.125rem, 1.8): readings and mystic descriptions; often letter-by-letter animated at 30ms/glyph.
- **Label** (500, 0.75rem, tracking 0.05em): mono, for metadata only — never as a "technical costume".

**The Two Voices Rule.** Marketing surfaces speak contemporary Thai and address the
visitor as คุณ, set in Anuphan/Noto Sans Thai. Inside the reading experience the
oracle speaks as ข้า to เจ้า, set in Sarabun Light. Never mix registers in one
sentence; never let the oracle voice write a button label on a marketing page.

## Layout

Mobile-first, single-column narrative flow. Marketing sections are full-width bands
with `py-20`–`py-24` (80–96px) vertical rhythm and centered containers: `max-w-4xl`
for text-led sections, `max-w-6xl` for card grids. Card grids collapse
3→1 (`md:grid-cols-3`) with 24–32px gaps. The app shell (dashboard) shares the
public top bar + hamburger chrome, with a 44px minimum touch target everywhere.

Route architecture mirrors the sectioning: all public marketing surfaces live in the
`(marketing)` route group and share one nav/footer chrome; new sections (tarot,
shop) are added as siblings inside that group and registered once in the nav
config — the chrome scales without touching page code.

## Elevation & Depth

No gray shadows anywhere. Depth is conveyed three ways: tonal layering (voidBlack →
deepNight → darkPurple), 1px `white/10` edges on glass cards, and colored glow —
`shadow-royalPurple/40` under primary CTAs, per-element glow under element cards.
Glassmorphism (`backdrop-filter: blur(8–10px)` over a 135° deepNight gradient) is
reserved for content cards floating over imagery or video.

**The Glow-Not-Shadow Rule.** Lift is always colored, never gray. In the dark
room an element emits light (a glow from its own hue family); in daylight it
casts a soft purple-tinted shadow (`rgba(107,33,168,0.08)` on glass cards).

## Shapes

Soft but not bubbly: buttons and inputs at 8px radius, content cards at 16px
(`rounded-2xl`), pills/dots/progress fully round. Cards carry a 1px `white/10`
border; inputs a 1px darkPurple border that shifts to a Royal Purple focus ring.
Decorative geometry is circular (orbs, particles, glow blobs) echoing celestial
bodies — no sharp diagonal cuts.

## Components

### Buttons
- **Shape:** gently rounded (8px), generous padding (16px 40px), Anuphan semibold.
- **Primary:** `bg-accent text-accentInk` — text on an accent fill is `accentInk` (light in BOTH modes, never `ink`). Hover brightens to `accentBright`. Lift: `shadow-accent/40` in dark, halved to `shadow-accent/20` in light (`dark:` modifier) so white pages don't glow.
- **Outline:** 2px `border-accentBright/60`, `text-accentBright`; hover fills `accentBright/10` (light) / `accentBright/15` (dark), text goes `ink`.
- **Secondary/soft:** `bg-surface2 text-ink border border-edge`; hover `bg-edge`. Never a borderless pale fill on light — a control must read as pressable at a glance in both themes.
- **Focus:** `ring-2 ring-accentBright` visible on both grounds; scale 1.05 hover / 0.95 tap, skipped under reduced motion.

**The One Button Kit Rule.** Every pressable control uses the shared `Button`
variants (default / outline / ghost) or the classes above verbatim — no
hand-rolled one-off button styling in page components.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** `linear-gradient(135deg, rgba(168,85,247,0.05), rgba(15,10,26,0.8))` + `backdrop-filter: blur(10px)`.
- **Border:** 1px `rgba(255,255,255,0.1)`.
- **Hover:** lift `-translate-y-1` + scale 1.02 on desktop, `active:scale-[0.98]` on touch.
- **Internal Padding:** 24px mobile / 32px desktop.

### Inputs / Fields
- **Style:** Deep Night bg, 1px Dark Purple border, 8px radius, Ghost White text, Ash Gray placeholder.
- **Focus:** 2px Royal Purple ring, border fades transparent.

### Navigation
- **Marketing nav — one row at every breakpoint** (~56px, sticky, `bg-ground/80` blur, `border-b border-edge`), driven by the `SITE_SECTIONS` config; new sections append there.
  - **Desktop ≥1024px:** brand (Anuphan, `text-accentBright`) · inline section links · spacer · ThemeToggle · primary CTA.
  - **Tablet 768–1023px:** same as desktop with tighter gaps while links fit; overflow collapses into the hamburger.
  - **Mobile <768px:** brand · spacer · ThemeToggle · CTA · hamburger (lucide `Menu`/`X`, ≥44px target). No second link row.
  - **Hamburger drawer:** slide-down panel attached under the bar (`bg-ground/95` blur, `border-b border-edge`), section links + เข้าสู่ระบบ as full-width 44px rows; framer-motion height/opacity reveal honoring reduced motion; `aria-expanded`/`aria-controls`, closes on Escape, outside tap, and route change.
  - **Link states:** rest `text-inkMuted`, hover `text-ink bg-edgeSoft`, active route `bg-accent/15 text-accentBright`.
- **App nav:** same sticky top bar as marketing (`AppHeader`), `sticky top-0 z-40 h-14`; inline underline-active tab links ≥md, hamburger drawer <md with icon+label rows, theme toggle, and ออกจากระบบ.

### Signature: the Oracle reveal
Long-form readings appear letter-by-letter (30ms/glyph) in Sarabun Light, as if
being spoken. Reserve it for oracle text; UI copy appears instantly.

### Signature: media placeholders
Until real art lands, image slots use the `MediaPlaceholder` component: a 16px-radius
frame in deepNight with a faint amethyst orb (element-tinted via `glowColor` when the
asset belongs to a ธาตุ), labeled with the exact asset spec (e.g. `1600×900 · WebP`;
`compact` variant for small in-card slots). Placeholders are honest scaffolding — they
occupy the final layout box (fixed aspect-ratio) so the composition is real before
the art is.

**The Clay Cast Rule.** All illustrative imagery is soft 3D clay-style renders —
matte, rounded, single soft light, on transparent ground (PNG/WebP alpha), sitting
on the purple ladder unless the subject is a user's ธาตุ. No photography, no flat
vector illustration, no stock 3D gloss. One cast, one material, every prop in the
diviner's room.

## Do's and Don'ts

### Do:
- **Do** keep every surface on the purple ladder; introduce element hues only as user-data payloads.
- **Do** respect `prefers-reduced-motion`: suppress particles, video autoplay, and scale effects.
- **Do** keep Thai body text at 400/1.75 and ≤ 68ch — readings are the product.
- **Do** give every interactive element a ≥44px touch target.
- **Do** add new public sections inside `(marketing)` and register them in the nav config only.

### Don't:
- **Don't** cast gray shadows in either mode — lift is colored (glow in dark, purple-tinted shadow in light).
- **Don't** hardcode palette hex in components — use the semantic tokens; a section pinned to one mood wraps itself in `data-theme="dark"`.
- **Don't** use the oracle voice (เจ้า/ข้า, Sarabun) on marketing chrome, or คุณ inside the reading experience.
- **Don't** stack a second grain/noise layer on any surface.
- **Don't** use emoji as icons in UI chrome (lucide-react is the icon system); emoji live only in share copy.
- **Don't** center long-form Thai paragraphs; center only display lines of ≤2 rows.
