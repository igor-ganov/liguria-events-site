# Design — city facets

Satisfies `requirements.md` R1–R4.

## 1. One route, two kinds of thing (R3.1)

`/{region}/{city}/{slug}/` is already server-rendered for venues. A second
dynamic route at the same position is not possible, and a prerendered one would
reintroduce the staleness R1.2 forbids.

**Chosen:** the existing route resolves the slug first as a facet, then as a
venue. Facet slugs are a closed set — `today`, `tomorrow`, `this-weekend`,
`free` — so the precedence is decidable without a lookup.

*Rejected:* a `/when/` or `/quando/` prefix segment. It buries the keyword the
page is meant to rank for and adds a level nobody types.

## 2. A facet is a predicate plus a name (R1.1, R1.3, R1.4)

```
type Facet = { slug; window: (today: string) => (event) => boolean; titleKey }
```

Date windows come from the same `occursBetween` predicate the feed, the map and
the calendar already share, so a container is judged by its programme here too —
a festival with no evening today does not appear under `today`.

The weekend is Saturday and Sunday of the current week WHILE it is already
Saturday or Sunday, and the coming ones otherwise. Computed from an ISO date
with no `Date` arithmetic beyond day-of-week, so it is a pure function with
tests rather than a timezone question.

## 3. Rendering reuses everything (R2.1, R4.1)

The facet page is `FeedView` with a narrowed event list and its own title —
the same component the region, city and venue pages use, so the empty state,
the JSON-LD and the feed markup cannot drift. `FeedScope` gains a `facet`.

## 4. Sitemap (R2.2)

Facet URLs join the events sitemap, the same place venue URLs went when they
became server-rendered, and only while the facet has events.

## Traceability

| Requirement | Design | Verified by |
| --- | --- | --- |
| R1.1–R1.4 | §2 | `test/city-facets.test.ts` |
| R2.1, R3.2 | §1, §3 | `e2e/owner-city-facets.spec.ts` |
| R2.2 | §4 | `e2e/seo-discovery.spec.ts` |
| R3.1 | §1 | `test/city-facets.test.ts` |
| R4.1, R4.2 | §3 | `e2e/owner-city-facets.spec.ts` |
