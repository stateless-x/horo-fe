---
name: สายมู
description: ดูดวงออนไลน์ที่เข้าใจตัวตน — โหราศาสตร์ไทย × ดวงจีนปาจื้อ × จิตวิทยา MBTI
colors:
  void-black: "#0A0A0F"
  deep-night: "#0F0A1A"
  dark-purple: "#1A0A2E"
  royal-purple: "#6B21A8"
  amethyst: "#A855F7"
  lavender-glow: "#C084FC"
  pale-orchid: "#E9D5FF"
  ghost-white: "#F5F5F5"
  ash-gray: "#A1A1AA"
  charcoal: "#18181B"
  element-earth: "#D4A843"
  element-fire: "#E85D3A"
  element-water: "#4A90D9"
  element-wood: "#5BA55B"
  element-metal: "#C0C0C0"
typography:
  display:
    fontFamily: "Prompt, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "Prompt, sans-serif"
    fontSize: "clamp(1.875rem, 3vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Prompt, sans-serif"
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
    backgroundColor: "{colors.royal-purple}"
    textColor: "{colors.ghost-white}"
    rounded: "{rounded.md}"
    padding: "16px 40px"
  button-primary-hover:
    backgroundColor: "{colors.amethyst}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.amethyst}"
    rounded: "{rounded.md}"
    padding: "16px 40px"
  card-glass:
    backgroundColor: "{colors.deep-night}"
    textColor: "{colors.ghost-white}"
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
- Dark-only by construction; there is no light theme and none should be added

## Colors

A ten-step purple ladder from near-black to pale orchid, plus five element accents
that belong to the user, not the brand.

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

**The Grain Rule.** The 3% film-grain overlay is global and non-negotiable. New
full-screen surfaces inherit it automatically via `body::before`; never stack a
second grain layer.

## Typography

**Display/Heading Font:** Prompt (with sans-serif fallback)
**Body Font:** Noto Sans Thai (with sans-serif fallback)
**Oracle Font:** Sarabun Light 200–300 (with sans-serif fallback)
**Latin Accent Font:** Space Grotesk — English words inside Thai UI (MBTI, Bazi)
**Mono Font:** JetBrains Mono — version tags, data labels

**Character:** Prompt's geometric loops give headings a modern-Thai confidence;
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
visitor as คุณ, set in Prompt/Noto Sans Thai. Inside the reading experience the
oracle speaks as ข้า to เจ้า, set in Sarabun Light. Never mix registers in one
sentence; never let the oracle voice write a button label on a marketing page.

## Layout

Mobile-first, single-column narrative flow. Marketing sections are full-width bands
with `py-20`–`py-24` (80–96px) vertical rhythm and centered containers: `max-w-4xl`
for text-led sections, `max-w-6xl` for card grids. Card grids collapse
3→1 (`md:grid-cols-3`) with 24–32px gaps. The app shell (dashboard) uses a bottom
tab bar on mobile with safe-area insets and a 44px minimum touch target everywhere.

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

**The Glow-Not-Shadow Rule.** If an element needs lift, it emits light (a colored
glow from its own hue family); it never casts a gray drop shadow.

## Shapes

Soft but not bubbly: buttons and inputs at 8px radius, content cards at 16px
(`rounded-2xl`), pills/dots/progress fully round. Cards carry a 1px `white/10`
border; inputs a 1px darkPurple border that shifts to a Royal Purple focus ring.
Decorative geometry is circular (orbs, particles, glow blobs) echoing celestial
bodies — no sharp diagonal cuts.

## Components

### Buttons
- **Shape:** gently rounded (8px), generous padding (16px 40px), Prompt semibold.
- **Primary:** Royal Purple bg, Ghost White text, `shadow-lg shadow-royalPurple/40`.
- **Hover / Focus:** bg brightens to Amethyst, glow follows (`shadow-amethyst/40`); scale 1.05 on hover, 0.95 on tap (skipped under reduced motion).
- **Outline:** 2px Amethyst/60 border, Amethyst text; hover fills `amethyst/15` and text goes Ghost White.

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
- **Marketing nav:** slim translucent bar over voidBlack, สายมู wordmark in Amethyst (Prompt), section links in Ash Gray → Ghost White on hover, one primary CTA button right-aligned. Driven by a single section config; new sections append there.
- **App nav:** bottom tab bar (mobile) with icon+label, active tab in Amethyst.

### Signature: the Oracle reveal
Long-form readings appear letter-by-letter (30ms/glyph) in Sarabun Light, as if
being spoken. Reserve it for oracle text; UI copy appears instantly.

### Signature: media placeholders
Until real art lands, image slots use the `MediaPlaceholder` component: a 16px-radius
frame in deepNight with a faint amethyst orb, labeled with the exact asset spec
(e.g. `1600×900 · WebP`). Placeholders are honest scaffolding — they occupy the
final layout box (fixed aspect-ratio) so the composition is real before the art is.

## Do's and Don'ts

### Do:
- **Do** keep every surface on the purple ladder; introduce element hues only as user-data payloads.
- **Do** respect `prefers-reduced-motion`: suppress particles, video autoplay, and scale effects.
- **Do** keep Thai body text at 400/1.75 and ≤ 68ch — readings are the product.
- **Do** give every interactive element a ≥44px touch target.
- **Do** add new public sections inside `(marketing)` and register them in the nav config only.

### Don't:
- **Don't** add a light theme, gray drop shadows, or pure #000/#FFF.
- **Don't** use the oracle voice (เจ้า/ข้า, Sarabun) on marketing chrome, or คุณ inside the reading experience.
- **Don't** stack a second grain/noise layer on any surface.
- **Don't** use emoji as icons in UI chrome (lucide-react is the icon system); emoji live only in share copy.
- **Don't** center long-form Thai paragraphs; center only display lines of ≤2 rows.
