# Requirements — HTTP semantics for absent and deleted content

## Overview

The site answers three different situations with the same status code, and the
code it picks is wrong for two of them.

| Situation | Today | Should be |
| --- | --- | --- |
| A real place with nothing on right now | **404** | 200 + "nothing on here" |
| An event that existed and is permanently gone | **404** | **410** + an explanation |
| A URL that never named anything | 404 | 404 |

Verified on production, 2026-08-24:

- `https://dovego.it/liguria/savona/` → **404**. Savona is a provincial capital
  of Liguria. It has no events in the corpus at this moment, so the page was
  never generated. The site is telling a visitor — and Google — that a real
  Italian city does not exist here.
- `https://dovego.it/event/1e6b4b74d225/` → **404**. That event existed; its
  record expired before the archive was introduced. 404 says "never heard of
  it", and Google keeps such URLs in its index far longer than it keeps a 410.
- Venue pages are generated only above a three-event threshold, so a venue with
  one or two events is a 404 for the same wrong reason.

Why it matters beyond correctness: Search Console currently reports **15 806**
URLs on this site excluded as 404s. A 410 is the signal that removes them
deliberately rather than waiting for Google to lose interest.

## User stories

### S1 — A visitor lands on a place with nothing on

*As someone who followed a link to a city or venue, I want to be told there is
nothing on there right now and be shown where to go instead, rather than be told
the page does not exist.*

- **R1.1** — WHEN a visitor requests a city page for a city the site recognises
  AND no upcoming events are filed under it, THE SYSTEM SHALL respond `200` with
  a page naming that city and stating that nothing is on.
- **R1.2** — WHEN a visitor requests a venue page under a recognised city AND no
  upcoming events are filed at that venue, THE SYSTEM SHALL respond `200` with a
  page naming the venue and stating that nothing is on.
- **R1.3** — WHERE a page is empty, THE SYSTEM SHALL offer at least one way
  onward: the city's own feed for a venue, the region's feed for a city.
- **R1.4** — THE SYSTEM SHALL recognise every province capital as a city,
  whether or not it currently has events. Liguria has four; three have pages.
- **R1.5** — WHILE a page is empty, THE SYSTEM SHALL exclude it from the
  sitemap, so an empty page is reachable but not advertised.

### S2 — A visitor follows a link to an event that is over and gone

*As someone who followed a months-old link, I want to be told the event is no
longer available, and I want search engines to be told the same thing in a way
they act on.*

- **R2.1** — WHEN a visitor requests an event whose identifier is well-formed
  AND no record resolves in the corpus, the database or the archive, THE SYSTEM
  SHALL respond `410` with a page explaining the event is no longer available.
- **R2.2** — THE SYSTEM SHALL offer a way onward from that page.
- **R2.3** — THE SYSTEM SHALL NOT respond `410` for an event it can still
  resolve; a past event that is still archived keeps its `200` and its content.

### S3 — A visitor requests something that never existed

*As the operator, I want genuine nonsense to keep answering 404, so the signal
stays meaningful.*

- **R3.1** — IF an event identifier is not well-formed, THEN THE SYSTEM SHALL
  respond `404`.
- **R3.2** — IF a city slug is not a city the site recognises, THEN THE SYSTEM
  SHALL respond `404`.

### S4 — The operator is told when these codes regress

- **R4.1** — THE SYSTEM SHALL check, on every health run, that a city with no
  events answers `200`, that a gone event answers `410`, and that nonsense
  answers `404`.

## Out of scope

- Reviving the 15 806 already-dead URLs. Their records expired before the
  archive existed; they cannot be resolved and will answer 410, which is the
  point.
- Time-bound landing pages, and per-city or per-category feeds.
