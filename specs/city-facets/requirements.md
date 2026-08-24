# Requirements — city facets (today, tomorrow, this weekend, free)

## Overview

The demand Search Console shows is venue-shaped, and venue pages now answer it.
The other shape people type is time-bound — *cosa fare a Genova oggi*, *questo
weekend* — and price-bound — *eventi gratis a Milano*. The site has a region
page, a city page and a calendar month, and nothing between them.

One mechanism, four facets of a city feed: `today`, `tomorrow`, `this-weekend`,
`free`.

## User stories

### S1 — Someone asks what is on today

- **R1.1** — WHEN a visitor requests a city's `today` page, THE SYSTEM SHALL
  list the events happening on the current date in Rome, and no others.
- **R1.2** — WHILE the page is served, THE SYSTEM SHALL compute "today" at
  request time, not at build time. The site rebuilds every six hours; a page
  built at 23:23 would call yesterday's events today until the morning.
- **R1.3** — `tomorrow` SHALL be the day after, and `this-weekend` the coming
  Saturday and Sunday — the current ones WHILE it is already the weekend.
- **R1.4** — `free` SHALL list events the sources marked as free entry.

### S2 — Nothing is on

- **R2.1** — WHEN a facet has no events, THE SYSTEM SHALL respond `200` with the
  same honest empty state the city and venue pages use, and a way onward.
- **R2.2** — THE SYSTEM SHALL list a facet page in the sitemap ONLY while it has
  events. An empty page is reachable, not advertised.

### S3 — The URLs do not collide

- **R3.1** — A facet slug SHALL take precedence over a venue of the same slug;
  there is no venue named "today".
- **R3.2** — IF the city is not recognised, THEN THE SYSTEM SHALL respond `404`,
  exactly as the venue route does.

### S4 — Each facet says what it is

- **R4.1** — Each facet SHALL carry its own title and description, in all three
  languages, naming the city and the window.
- **R4.2** — Each facet page SHALL declare its own canonical URL and the other
  two languages.

## Out of scope

Category facets (`concerti`, `mostre`), per-city RSS, the visible calendar
invitation. Same shape, next batch.
