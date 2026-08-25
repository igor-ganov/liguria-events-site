# Requirements — events made here, not only found here

## Why

The site is an aggregator with a submission form bolted on: 7 794 page views a
week and, before the funnel was opened, zero submitted events in a fortnight.
An aggregator's content is by definition available elsewhere — every event on
it was copied from a source that already published it.

The pivot: **anyone can make an event here in a minute and share the link**.
That produces the one thing a crawler cannot — an event that exists nowhere
else — and it gives a visitor a reason to come back that reading a listing
never will.

Two audiences, one form:

| | wants | must not happen |
| --- | --- | --- |
| A friend organising something | a link to send to twelve people | it appears in the public feed, the channel digest, or Google |
| An organiser with a public event | to be found in their city's feed | it waits days for a human to notice it |

## R1 — Making one

1. WHEN a visitor opens the form, THE SYSTEM SHALL let them fill it in without
   an account, and ask for one once, at the moment they send it.
2. WHEN an event is created, THE SYSTEM SHALL ask the author who may see it and
   SHALL default to "only people with the link".
3. WHEN an event is created, THE SYSTEM SHALL show its link and a way to copy
   or share it, without a further step.

## R2 — A link-only event stays that way

1. A link-only event SHALL open for anyone holding its URL.
2. THE SYSTEM SHALL NOT list it in any feed, the sitemap, the RSS feeds, or the
   channel digest.
3. THE SYSTEM SHALL declare it `noindex` so a leaked link does not become a
   search result.

## R3 — A public event earns its place

1. WHEN the author chooses "public", THE SYSTEM SHALL hold it for moderation
   exactly as a submission is held today.
2. WHILE it is held, THE SYSTEM SHALL show it to its author only, as now.
3. WHEN it is published, THE SYSTEM SHALL mark it as made on the platform,
   everywhere it is shown.

## R4 — Made here is findable as such

1. THE feed SHALL offer a filter for events made on the platform.
2. WITHIN a given day, THE SYSTEM SHALL order platform events before crawled
   ones.
3. THE SYSTEM SHALL NOT let a platform event outrank a crawled event happening
   sooner: the site's question is "what is on today", and a boost across days
   would answer a different one.

## R5 — It cannot become a spam surface

1. THE SYSTEM SHALL require an account before anything is stored.
2. THE SYSTEM SHALL NOT publish anything that has not passed moderation.
3. THE SYSTEM SHALL bound how many events one account may create in a day.

## R6 — It cannot rot quietly

1. THE health report SHALL assert that a link-only event is absent from the
   sitemap and carries `noindex`, and that a published platform event carries
   its mark.
