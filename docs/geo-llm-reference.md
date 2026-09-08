# The LLM/GEO layer: reference pages, topic hubs, and llms.txt

Everything here exists for one job: when someone asks an AI assistant about
ดูดวงในไทย, we want สายมู named in the answer, spelled right, linked right,
and described accurately — including the parts we don't do.

## The content model

One page per concept. There is no second, thinner page for any topic.

| Layer | URL | Wins the query | Shape |
| --- | --- | --- | --- |
| Topic hub | `/<slug>` | `<หัวข้อ>คืออะไร`, `ดูดวง<หัวข้อ>`, lookup queries | Tables, direct answers, CTA |
| MBTI type | `/mbti/<type>` | `<TYPE> นิสัย`, `<TYPE> คือ`, `<TYPE> ดวง` | One type per page, ×16 |
| Index | `/learn` | browse intent only | Lists the hubs, owns no topic content |
| Reference | `/ai` | `สายมูคืออะไร` | Facts, boundaries, citation block |
| Machine | `/llms.txt` | — | Generated plain text index |

### Why `/mbti/<type>` is allowed and `/learn/<slug>` was not

They look like the same move and are the opposite one. `/learn/bazi` was a
second page for a concept `/bazi` already owned — one concept, two pages,
split signal. The sixteen type pages are sixteen *different* concepts:
"INFJ นิสัย" and "ESTP คือ" are distinct head queries, and a hub whose table
lists sixteen types cannot outrank a page about one of them.

The test before adding any child layer: **does the child target a query the
parent could win?** If yes, it is cannibalisation — deepen the parent. If no,
it is a real page.

Type content lives in `src/lib/mbti-types.ts`; the slug order is duplicated in
`src/lib/mbti-type-slugs.ts` so the hub table can link its rows without the
two files importing each other. They are checked against each other at module
load, so a reorder fails the build rather than silently mislinking a row.

### Why there is no `/learn/<slug>` layer

There was one, for about an hour on 2026-09-08. Each explainer targeted the
same concept as its own hub while carrying strictly less: no tables, no
English brief and no `status` field. `/mutelu` and `/learn/mutelu` had drifted
into two verbatim-identical FAQ questions, both emitting `FAQPage` JSON-LD —
two pages arguing over one query.

The four explainers were folded into their hubs and `/learn/<slug>` now 301s
to `/<slug>` (`next.config.ts`). **Do not reintroduce the layer.** If a topic
needs more beginner material, deepen its hub: add a section whose `answer`
stands alone, and put the basics above the tables.

## Where the content lives

Two registries. Nothing else holds facts.

- `src/lib/knowledge-base.ts` — what สายมู **is**. Entity sentence, the
  ศาสตร์ผสาน method, systems and their status, readings, boundaries, Q&A,
  citation line, English reference block.
- `src/lib/topic-pages.ts` — the topic hubs, one entry per page.

These feed, in both directions automatically:

```
knowledge-base.ts ──┬──> /ai                (components/seo/ai-reference.tsx)
                    └──> /llms.txt          (app/llms.txt/route.ts)

topic-pages.ts ─────┬──> /<slug>            (app/(marketing)/[topic])
                    ├──> sitemap.xml        (app/sitemap.ts)
                    ├──> footer nav         (components/layout/footer.tsx)
                    ├──> /learn index       (components/learn/learn-index.tsx)
                    └──> /llms.txt

mbti-types.ts ──────┬──> /mbti/<type>       (app/(marketing)/mbti/[type])
                    ├──> sitemap.xml
                    ├──> the hub's 16-row table (via mbti-type-slugs.ts)
                    └──> /llms.txt
```

## Adding a topic hub

1. Append a `TopicPage` to `TOPIC_PAGES` in `src/lib/topic-pages.ts`.
2. That's it. Route, sitemap entry, footer link and llms.txt entry all follow.

There is no second page to write. `/learn` picks the new hub up automatically
because it renders `TOPIC_PAGES.filter(status === 'live')`.

A hub earns its place when the topic has **both** lookup-shaped queries (facts
people re-open a page to check) and a connection to what the product does. A
topic with neither belongs in `/ai`, not in its own page.

## Launching tarot (the worked example)

Tarot is already written up everywhere as `status: 'planned'`, which is why
`/ai` and `/llms.txt` can answer "does สายมู do tarot?" honestly today.
When it ships:

1. `src/lib/knowledge-base.ts` — flip the tarot entry in `SAIMU_SYSTEMS` and
   in `READINGS` to `status: 'live'`, rewrite `statusNote`, and set
   `onSaimu: true` for ไพ่ทาโรต์ in `THAI_DIVINATION_LANDSCAPE`.
2. Update the tarot Q&A in `QA_PAIRS` — it currently says "ยังไม่ได้".
3. Bump `LAST_VERIFIED` and `LAST_VERIFIED_TH`.
4. Add a `/tarot` hub to `TOPIC_PAGES` with real spread tables.
5. `src/lib/systems.ts` and `src/lib/site-sections.ts` for the product side
   (see `docs/adding-a-system.md`).

## Rules that are not style preferences

**Never fabricate.** No user counts, no ratings, no testimonials, no accuracy
claims, no awards. A fake fact repeated back by an answer engine is a
reputation problem you cannot recall. `PRODUCT.md` says the same thing.

**Planned means planned, everywhere.** A `status: 'planned'` system reads as
unavailable on every surface until the day it ships. Half-launching in copy is
how a site teaches models something false about itself.

**Collapsed is fine; hidden is cloaking.** The English blocks render inside
`<details>`: the text is in the server HTML, one click from any reader, and
Google indexes it normally. Do not "improve" this with `display:none`, an
off-screen div, or client-only rendering. Same rule as the homepage FAQ.

**One entity, one `@id`.** Every page's Organization node uses
`https://xn--y3cbx6azb.com/#organization`. Two pages describing the same
company with different identifiers produce two weak entities instead of one
strong one. `components/seo/seo-sections.tsx` holds the homepage copy of it.

**Bump the date when facts change.** `LAST_VERIFIED` appears on `/ai`, on
every hub, in both txt files, and in JSON-LD `dateModified`. A page claiming
freshness it doesn't have is worse than an undated one.

## Verifying after a deploy

```bash
curl -s https://xn--y3cbx6azb.com/llms.txt | head -20
curl -s https://xn--y3cbx6azb.com/sitemap.xml | grep -c '<loc>'
curl -s https://xn--y3cbx6azb.com/ai | grep -c 'application/ld+json'
```

Locally, after `npm run build`, the prerendered HTML is the truth:

```bash
grep -o '"@type":"[A-Za-z]*"' .next/server/app/ai.html | sort -u
grep -c 'lang="en"' .next/server/app/bazi.html
```

Structured data itself is worth validating at
<https://validator.schema.org/> and Google's Rich Results Test.

## Known gap, not fixed here

`components/seo/seo-sections.tsx` lists `https://twitter.com/สายมู` in
`sameAs`, and `app/layout.tsx` sets `twitter.site` to `@สายมู`. X handles
cannot contain Thai script, so both point at nothing. A `sameAs` that 404s
weakens entity resolution rather than helping it — replace them with the real
profile URLs, or delete them.
