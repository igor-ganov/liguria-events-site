# Trilingual Site (EN / IT / RU) — Requirements

## Overview

Serve the calendar & feed in English, Italian and Russian with **path-based
routing** (`/`, `/it/`, `/ru/`, like the blog). UI chrome (nav, chips,
headings, badges, empty states, month/day names, footer) is translated via
**Markdown files** — one per language — loaded as an Astro content collection.
Event **descriptions** come pre-translated from the worker's `/events.json`
(`d` is now `{ en, it, ru }`); **titles and venues stay original Italian**.
Depends on the bot's data-model change (`specs/i18n/` in `event-collecter`).

Locales: `en` (default, root path), `it`, `ru`. Missing translation → English.

## US-1: Path-based locales

- **AC-1.1** THE SYSTEM SHALL render every page for each locale: en at `/`,
  `/feed/`, `/event/<id>/`; it at `/it/…`; ru at `/ru/…` (static build).
- **AC-1.2** A language switcher (header + FAB popup) SHALL link to the current
  page in the other locales; the active locale is the URL.
- **AC-1.3** `<html lang>` and `hreflang` alternates SHALL reflect the locale.
- **AC-1.4** Unknown/missing localized copy SHALL fall back to English, never
  render a blank or a raw key.

## US-2: UI copy in Markdown (the scaffold)

- **AC-2.1** All static UI strings SHALL live in `src/content/ui/{en,it,ru}.md`
  (frontmatter data for labels; body for any long-form copy) — one file per
  language, no UI text hardcoded in components.
- **AC-2.2** The build SHALL validate every language file has the same key set
  (a missing key fails the build, not silently at runtime).
- **AC-2.3** Category labels, weekday/month names, chip labels, badges
  (free / 💎 gem), empty-state and section headings SHALL be localized.

## US-3: Localized data rendering

- **AC-3.1** Each locale page SHALL show the event description in that language
  (`d[lang] ?? d.en`); titles, venues, dates render once (language-agnostic).
- **AC-3.2** The event detail page SHALL be localized per route; its source
  links and image attribution are language-agnostic.

## US-4: Preserve prior behaviour

- **AC-4.1** Dark theme, flying FAB menu, view transitions, whole-card links,
  hidden-gem filter, mobile agenda SHALL keep working in every locale.
- **AC-4.2** The functional-frontend dogma (≤50-line files, one export, no
  if/ternary in `src/`, Effect at the boundary, tested pure functions) SHALL
  hold for all new code, lint-enforced.

## NFR

- **AC-5.1** Every new pure function (locale resolution, UI-dict lookup with
  fallback, localized-description picker, alternate-URL builder) SHALL be
  unit-tested.
