# Trilingual Site — Tasks

Prereq: the bot ships the `d` = `{en,it,ru}` map in `/events.json` (Phase B1).

Phase S1 — locale plumbing:

- [x] **I1. Astro i18n config + locales lib** — `locales.ts` (Locale union,
  guard, default). _AC-1.1. Tests: `test/i18n-locale.test.ts`._
- [x] **I2. UI content collection** — `content.config.ts` Zod schema (key
  parity) + `src/content/ui/{en,it,ru}.md`; `ui-of.ts` loader w/ EN fallback.
  _AC-2.x. Tests: `test/ui-of.test.ts`._
- [x] **I3. localized-url + descriptionOf** pure helpers. _AC-1.2, AC-3.1.
  Tests: `test/localized-url.test.ts`, `test/description-of.test.ts`._

Phase S2 — render in locales:

- [x] **I4. Schema `d` map** — `event-schema.ts` LocalizedText; components use
  `descriptionOf(lang)`. _AC-3.1._
- [x] **I5. UI island + component refactor** — embed `#ui-data`; replace
  hardcoded EN (`category-label`, `month-names`, chips, tags, feed, ongoing,
  day-heading, month-title) with `ui`-driven lookups. _AC-2.3. Tests updated._
- [x] **I6. Shared view components + per-locale routes** — CalendarView/
  FeedView/EventDetail; `src/pages/[lang]/…` getStaticPaths over locales
  (×events for detail). _AC-1.1._
- [x] **I7. Switcher + hreflang + html lang** — header & FAB links via
  `localizedUrl`; Layout alternates. _AC-1.2/1.3._

- [x] **I8. Green + deploy** — lint + typecheck + tests + build (~543 pages)
  clean; Pages deploy; verify /it/ and /ru/ live, switcher, gem/free filters,
  theme, FAB, view transitions in each locale.
