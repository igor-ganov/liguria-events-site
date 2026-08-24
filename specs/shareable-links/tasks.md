# Tasks — a shared link that looks like something

- [x] **T1 — `clipText`**, the word-boundary cut for meta descriptions.
      *Satisfies* R1.4 · *Design* §3
- [x] **T2 — The image proxy** `/img/[...]`, host-allowlisted, cached.
      *Satisfies* R2.1–R2.3 · *Design* §2
- [x] **T3 — `socialImage`**, the picture for a scope, through the proxy, with
      the branded fallback.
      *Satisfies* R1.1–R1.3 · *Design* §1
- [x] **T4 — Wire it into `FeedView`** so every listing page has one.
      *Satisfies* R1.1 · *Design* §1
- [x] **T5 — Event pages**: proxied image, clipped description, `og:type`.
      *Satisfies* R1.3, R1.4, R1.5
- [x] **T6 — The default image** in `public/`, 1200×630.
      *Satisfies* R1.2
- [x] **T7 — The share control**, strings in all five places.
      *Satisfies* R3.1–R3.3 · *Design* §4
- [x] **T8 — Health check `og-images`.**
      *Satisfies* R4.1 · *Design* §5
- [ ] **T9 — Verified on production.**
