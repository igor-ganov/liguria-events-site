# Tasks — HTTP semantics for absent and deleted content

Ordered. One at a time, tree green between them.

- [x] **T1 — The collector publishes the place list.** `GET /places.json`:
      region → city slugs, from the canonical province-capital table.
      *Satisfies* R1.4 · *Design* §1 · *Test* collector `test/places.test.ts`

- [x] **T2 — The site reads it.** A build-time loader beside the corpus loader,
      degrading to the cities seen in events if the endpoint is unreachable, so
      an outage cannot delete every city page.
      *Satisfies* R1.4 · *Design* §1 · *Test* `test/places.test.ts`

- [x] **T3 — A city page exists for every recognised city.** `getStaticPaths`
      reads the place list instead of the events.
      *Satisfies* R1.1, R3.2 · *Design* §1 · *Test* `e2e/empty-states.spec.ts`

- [x] **T4 — The empty state.** One component: heading, sentence, link onward.
      Strings registered in all five places.
      *Satisfies* R1.1, R1.2, R1.3, R2.2 · *Design* §4 · *Test* e2e above

- [x] **T5 — Venue pages become server-rendered** and answer 200 for any slug
      under a recognised city, titled from the slug when unknown.
      *Satisfies* R1.2, R1.3 · *Design* §2 · *Test* `e2e/empty-states.spec.ts`

- [x] **T6 — Venue URLs move into a sitemap endpoint**, listing only venues with
      events.
      *Satisfies* R1.5 · *Design* §2 · *Test* `e2e/seo-discovery.spec.ts`

- [x] **T7 — A gone event answers 410**, a malformed id 404, an archived event
      still 200.
      *Satisfies* R2.1, R2.3, R3.1 · *Design* §3 · *Test* `test/gone-event.test.ts`,
      `e2e/owner-past-event.spec.ts`

- [x] **T8 — Health checks for all three codes.**
      *Satisfies* R4.1 · *Design* §6 · *Test* collector `test/health.test.ts`

- [ ] **T9 — Verify on production** and record the codes observed.
