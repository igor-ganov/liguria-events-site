# Trilingual Site — Design

Satisfies `specs/i18n/requirements.md`. Conventions: functional-frontend
(≤50-line files, one export, no if/ternary in `src/`, Effect at boundaries,
tested pure functions).

## 1. Astro i18n config (`astro.config.mjs`)

```js
i18n: {
  locales: ['en', 'it', 'ru'],
  defaultLocale: 'en',
  routing: { prefixDefaultLocale: false }, // en at /, it at /it/, ru at /ru/
}
```

`src/lib/i18n/locales.ts`: `LOCALES = ['en','it','ru']`, `Locale` union,
`isLocale`, `DEFAULT_LOCALE='en'`.

## 2. Routes (static, ×3 locales)

Page bodies live in shared Astro components so route files stay thin:

```
src/pages/index.astro            → <CalendarView lang="en"/>
src/pages/feed.astro             → <FeedView lang="en"/>
src/pages/event/[id].astro       → EN detail, getStaticPaths over events
src/pages/[lang]/index.astro     → getStaticPaths: it,ru → <CalendarView/>
src/pages/[lang]/feed.astro      → it,ru → <FeedView/>
src/pages/[lang]/event/[id].astro→ getStaticPaths: (it,ru) × events
```

`src/components/views/CalendarView.astro` / `FeedView.astro` /
`EventDetail.astro` take `lang`, render the Layout + the localized island +
the Lit host element. ~181 pages × 3 ≈ 543 static pages (build ~15s).

Rejected: a single `[...slug]` catch-all — explicit per-type routes keep
`getStaticPaths` readable and typed.

## 3. UI copy collection (the scaffold, MD)

`src/content/ui/{en,it,ru}.md` — Astro content collection `ui`, frontmatter
holds the string map, body reserved for long-form (help/about) later:

```yaml
---
nav: { calendar: 'Calendar', feed: 'Feed', bot: 'Telegram bot', ical: 'iCal' }
chips: { free: 'Free only', gems: '💎 Hidden gems' }
cat: { music: 'Music', theatre: 'Theatre', … }          # 11 keys
weekdays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
months: ['January', … 'December']
headings: { ongoing: 'Ongoing this month', sources: 'Sources', all: 'All events' }
badges: { free: 'free', gem: '💎 gem' }
empty: 'Nothing matches these filters yet.'
footer: 'Collected automatically from …'
---
```

- Zod schema (`src/content.config.ts`) types the frontmatter and **enforces
  key parity** — a missing key fails the build (AC-2.2).
- `src/lib/i18n/ui-of.ts`: `uiOf(lang) → Ui` via `getEntry('ui', lang)`,
  with English fallback per field (AC-1.4).

## 4. Getting UI strings into Lit (client)

Components render client-side, so the page embeds **two islands**: the events
(existing `#events-data`) and the active-locale UI dict + lang
(`#ui-data` = `{ lang, ui }`). `src/components/shared/read-ui-island.ts`
(Effect `Schema` decode, English-default fallback) returns `{ lang, ui }`.
Component controllers read it in `connectedCallback` alongside the events
island. `categoryLabel`, chip labels, weekday/month names, badges, empty
state all come from `ui` — the hardcoded English tables in `category-label.ts`,
`month-names.ts`, `render-chips.ts`, `render-tags.ts`, `render-feed.ts`,
`render-ongoing.ts`, `day-heading.ts`, `month-title.ts` are replaced by
`ui`-driven lookups (pure functions `(ui, key) => string`).

## 5. Localized data

- `event-schema.ts`: `d: Schema.optional(LocalizedTextSchema)` where
  `LocalizedText = { en, it, ru }`.
- `src/lib/events/description-of.ts`: `descriptionOf(lang)(event) → string`
  = `event.d?.[lang] ?? event.d?.en ?? ''`. Mini-card, event page, corpus use
  it. Titles/venues unchanged.

## 6. Switcher & alternates

- `src/lib/i18n/localized-url.ts`: `localizedUrl(lang, path)` builds the
  base-path-aware URL (`/`, `/it/…`, `/ru/…`), a pure function.
- Header + FAB popup render three switcher links via `localizedUrl`.
- Layout head emits `<link rel="alternate" hreflang>` for each locale and sets
  `<html lang>`.

## 7. Preserved behaviour

Theme, FAB, view transitions, whole-card links, gem filter, mobile agenda are
locale-agnostic — they read from `ui`/`d` but the mechanics are unchanged
(AC-4.1). The theme/FAB re-bind on `astro:after-swap` already survives locale
navigation.

## 8. Traceability

| Req | Design | Tests |
|---|---|---|
| AC-1.x | §1 §2 §6 | locale guard, localizedUrl, fallback |
| AC-2.x | §3 §4 | ui schema parity (build), uiOf fallback |
| AC-3.x | §5 | descriptionOf fallback, schema decode |
| AC-4.x | §7 | existing suites stay green |
