# Product

<!-- impeccable:product-schema 1 -->

> Status: active product context
> Last verified: 2026-09-04 against `src/app`, `src/features`, and `package.json`.
> Authority: when this document and the implementation disagree, the implementation wins.

## Platform

web

## Users

The primary audience is Thai Gen-Z women who want an approachable, personal way to explore astrology, daily guidance, compatibility, and self-understanding.

## Product Purpose

สายมู combines Thai astrology, Chinese Bazi, and MBTI-informed interpretation into personal readings and daily guidance. Success means a visitor can understand the offer quickly, complete onboarding comfortably, and return for useful readings.

## Positioning

The product connects traditional divination systems with contemporary personality language, presenting the result as one coherent personal experience rather than separate calculators.

## Operating Context

The experience spans public discovery pages, authentication and onboarding, a signed-in dashboard, daily fortune, full chart readings, compatibility flows, settings, and shareable public results.

## Capabilities and Constraints

- Preserve working application behavior and the existing Thai-language journeys.
- Support light-theme-first use across phone, tablet, and desktop web layouts.
- Generated visual assets must load efficiently and use responsive image delivery where appropriate.
- Astrology and element colors carry meaning and should not be used as arbitrary decoration.

## Brand Commitments

- Product name: สายมู.
- The frontend may be freely redesigned.
- The new direction should feel cute, contemporary, mystical, and especially appealing to Gen-Z women.
- Illustrative assets should share one soft 3D clay-render language, using the supplied purple hooded oracle image as the style reference.

## Evidence on Hand

- Existing routes and product flows: `src/app`.
- Existing chart, daily fortune, and compatibility experiences: `src/features` and `src/app/dashboard`.
- Existing design-system record: `DESIGN.md`.
- User-supplied clay-render style reference: `Screenshot 2569-09-04 at 16.31.45.png` (conversation attachment).
- No testimonials, commercial proof, or performance claims were supplied; future frontend work must not fabricate them.

## Product Principles

- Make mystical systems feel welcoming and personally relevant.
- Keep the path from curiosity to first reading simple.
- Let visual delight support comprehension, never compete with long-form Thai reading content.
- Maintain a coherent personality across public, onboarding, dashboard, and share surfaces.

## Accessibility & Inclusion

Use semantic controls, visible keyboard focus, sufficient contrast, reduced-motion support, and touch targets suitable for mobile use.
