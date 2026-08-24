# Tasks — city facets

- [x] **T1 — The facets themselves**: slugs, date windows, the weekend rule, as
      pure functions. *R1.1–R1.4, R3.1* · `test/city-facets.test.ts`
- [x] **T2 — Strings** for four facets × title/description × three languages,
      registered in all five places.  *R4.1*
- [x] **T3 — The route resolves a facet before a venue**, keeps 404 for an
      unrecognised city.  *R3.1, R3.2* · `e2e/owner-city-facets.spec.ts`
- [x] **T4 — Empty facets answer 200** with the shared empty state.  *R2.1*
- [x] **T5 — Non-empty facets enter the sitemap.**  *R2.2* · `e2e/seo-discovery.spec.ts`
- [x] **T6 — Verified on production**, 2026-08-24. All 200, titles substituted,
      an unrecognised city still 404. Sitemap: 5 208 URLs — 3 510 events,
      1 341 venues, 357 facets (119 city-facet pages × 3 languages, only the
      ones with events in them).
