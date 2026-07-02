# Liguria Events Site — Design

Satisfies `specs/site/requirements.md`. Conventions: functional-frontend
(≤50-line files, one export/file, folders by usage, no branching — switch /
strategy maps / Effect Match, Effect at boundaries) + typescript-style.

## 1. Stack & topology

- **Astro 5 static** (`output: 'static'`, `base: '/liguria-events-site'`),
  no SSR adapter. **Lit 3** components as plain client custom elements —
  Astro's Lit SSR integration is deprecated in v5, so components hydrate from
  an embedded JSON island instead (AC-1.1):
  `Layout` writes `<script type="application/json" id="events-data">` once;
  components read it in their controller (the imperative shell).
- **Effect** at the data boundary: build-time loader validates with
  `Schema`; client parse reuses the same schema. `runPromise`/`runSync` only
  at edges (astro frontmatter, element controller).

## 2. Modules (folders by usage)

```
src/lib/events/    — domain: schema.ts (types+Schema), categories.ts,
                     category-emoji.ts, category-label.ts,
                     covers-day.ts, is-upcoming.ts, sort-by-start.ts,
                     filter-by-categories.ts, filter-free-only.ts,
                     group-by-day.ts, format-when.ts
src/lib/calendar/  — month math: month-key.ts (YYYY-MM ops), add-months.ts,
                     month-title.ts, month-grid.ts (Mon-first CalendarDay[][]),
                     iso-today.ts (shell-adjacent: Date → ISO, Rome)
src/lib/branch.ts  — branch(cond)(onTrue, onFalse): lookup-map HOF replacing
                     the banned ternary at template seams
src/data/load-events.ts — build-time Effect pipeline (fetch → Schema → sort)
src/components/    — events-calendar.ts, events-feed.ts, category-chips.ts
                     (each ≤50 lines: reactive props + _ctl + delegating
                     render) with free functions in same-named subfolders
                     (controller.ts, render-*.ts)
src/layouts/Layout.astro, src/pages/index.astro, src/pages/feed.astro
```

## 3. Data contract

`CompactEvent` mirrors the worker: `{id,t,s,e?,c,f?,v?,h?,u}`;
`Schema.Struct` with optional fields; category = `Schema.Literal(...)` over
the closed 11-item union. Payload `{generatedAt, events}` (AC-1.2).

## 4. Rendering rules (no branching)

- Conditional template bits go through `branch(cond)(onT, onF)` — a
  `Record<'true'|'false', () => T>` lookup, or `Match.value` on unions.
- Calendar cell modifiers (muted/today) are **class strategy maps** keyed by
  a computed `DayKind` union (`'out' | 'today' | 'in'`) — exhaustive switch.
- Feed grouping renders `ReadonlyMap<day, events>` entries; the empty state
  is `branch(list.length === 0)`.

## 5. CI/CD (AC-4.3)

`.github/workflows/pages.yml`: on push to main + `schedule: '23 */6 * * *'`
+ dispatch → bun install → check (lint+typecheck+test) → `astro build` →
`actions/deploy-pages`. Pages configured with `build_type: workflow`.

## 6. Traceability

| Req | Design | Tests |
|---|---|---|
| AC-1.x | §1 §3 load-events | schema decode/reject tests |
| AC-2.x | month-grid, add-months, covers-day, DayKind | `test/calendar/*` |
| AC-3.x | filter-*, group-by-day, format-when | `test/events/*` |
| AC-4.x | Layout, pages.yml | build + lint gates |
| AC-5.1 | eslint.config.js (no-if/no-ternary, max-lines-no-imports, one-export) | `bun run lint` in CI |
