# Adding a public section (tarot, shop, …)

Public content sections live in the `(marketing)` route group and share one
chrome (nav + canonical rules). Adding a section takes four steps:

1. **Route** — create `src/app/(marketing)/<slug>/page.tsx` (server component
   preferred). Export `metadata` with a Thai `title`, `description`, and its
   own `alternates.canonical: '/<slug>'` — the group layout's canonical `/`
   leaks into any page that doesn't override it.
2. **Nav** — append one entry to `SITE_SECTIONS` in
   [`src/lib/site-sections.ts`](../src/lib/site-sections.ts). The marketing
   nav (desktop + mobile) renders from that list; nothing else to touch.
3. **Sitemap** — add the route in `src/app/sitemap.ts`.
4. **Design** — follow `DESIGN.md` at the repo root. Key rules for new
   sections: stay on the purple ladder (no new brand hue), marketing voice is
   contemporary Thai (คุณ), image slots use `MediaPlaceholder` until real
   assets exist.

A commerce section (shop) will also need its own `(marketing)/shop/layout.tsx`
if it wants extra chrome (cart button); put it in the section's folder, not in
the group layout.
