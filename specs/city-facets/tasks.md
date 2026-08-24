# Tasks — city facets

- [x] **T1 — The facets themselves**: slugs, date windows, the weekend rule, as
      pure functions. *R1.1–R1.4, R3.1* · `test/city-facets.test.ts`
- [x] **T2 — Strings** for four facets × title/description × three languages,
      registered in all five places.  *R4.1*
- [x] **T3 — The route resolves a facet before a venue**, keeps 404 for an
      unrecognised city.  *R3.1, R3.2* · `e2e/owner-city-facets.spec.ts`
- [x] **T4 — Empty facets answer 200** with the shared empty state.  *R2.1*
- [x] **T5 — Non-empty facets enter the sitemap.**  *R2.2* · `e2e/seo-discovery.spec.ts`
- [ ] **T6 — Verify on production.**
