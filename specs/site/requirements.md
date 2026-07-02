# Liguria Events Site — Requirements

## Overview

A public static website (GitHub Pages) rendering the corpus collected by
`liguria-events-bot`: a month **calendar** view and a chronological **feed**
with category filtering. Astro (static build) + Lit (client interactivity),
data fetched at build time from the worker's public `/events.json`; a
scheduled GitHub Action rebuilds the site so content stays fresh.

## US-1: Build-time data

- **AC-1.1** WHEN the site builds THE SYSTEM SHALL fetch `EVENTS_URL`
  (default `https://liguria-events-bot.igor-ganov.workers.dev/events.json`),
  validate the payload shape, and embed the events into the pages; an
  unreachable endpoint fails the build loudly (stale deploys keep serving).
- **AC-1.2** Events carry: id, title, start/end dates, optional time/venue,
  category, free flag, source URL — the worker's compact schema.

## US-2: Calendar page (`/`)

- **AC-2.1** THE SYSTEM SHALL render a month grid (Mon-first) of the current
  month with per-day event entries (category emoji + linked title).
- **AC-2.2** WHEN the user activates prev/next month controls THE SYSTEM
  SHALL re-render the grid client-side without a page load.
- **AC-2.3** Multi-day events SHALL appear on every day they cover.
- **AC-2.4** Days outside the displayed month SHALL be visually muted; today
  SHALL be highlighted.

## US-3: Feed page (`/feed/`)

- **AC-3.1** THE SYSTEM SHALL list upcoming events grouped by day, ascending,
  each entry: emoji, linked title, time/venue when known, free badge.
- **AC-3.2** WHEN the user toggles category chips THE SYSTEM SHALL filter the
  list client-side; multiple categories compose as OR; none selected = all.
- **AC-3.3** WHEN the user toggles "free only" THE SYSTEM SHALL additionally
  filter to free events (AND with categories).
- **AC-3.4** An empty filter result SHALL say so explicitly.

## US-4: Shell & operations

- **AC-4.1** Both pages share a header: site title, nav (Calendar / Feed),
  links to the Telegram bot and the iCal feed.
- **AC-4.2** The site SHALL work under the `/liguria-events-site` base path
  (GitHub Pages project site).
- **AC-4.3** A GitHub Action SHALL rebuild and deploy on push and on a
  schedule (every 6 hours), so the static data trails the collector by ≤6h.
- **AC-4.4** Interactive controls SHALL be keyboard-accessible buttons with
  visible focus and `aria-pressed` state on toggles.

## NFR

- **AC-5.1** Code follows functional-frontend dogma: files ≤50 lines
  (imports excluded), one exported function per file, no `if`/ternary in
  `src/` (lint-enforced), Effect pipelines at the data boundary, every pure
  function unit-tested (`bun test`).
