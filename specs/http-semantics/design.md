# Design — HTTP semantics for absent and deleted content

Satisfies `requirements.md` R1–R4.

## 1. Where the city list comes from (R1.1, R1.4, R3.2)

The site derives its cities from the events it holds, which is why a city with
no events has no page. The canonical list already exists — in the collector,
`src/domain/city.ts` maps every Italian province code to its capital, and
`city-centres.ts` holds a coordinate for each. That is the same table the
crawler files events under, so it is the *definition* of a city here.

**Chosen:** the collector publishes it at `GET /places.json` — region → city
slugs — and the site fetches it at build time beside the corpus. One source of
truth, and the site gains no 110-row table to drift from it.

*Rejected:* copying the table into the site. Two copies of a list that decides
URL structure is how `/liguria/savona/` disappears again the next time one of
them changes.

*Rejected:* deriving the list from the archive. Savona has never had an event,
so history would not produce it either.

## 2. Venue pages become server-rendered (R1.2, R1.3)

Venues are not canonical — they come from data, and a venue with nothing on
right now still deserves an answer. A prerendered route cannot answer for a slug
that was not in the build.

**Chosen:** `prerender = false` for `/{region}/{city}/{venue}/`. A request
resolves the venue from the corpus; if nothing matches, the page still renders,
titled from the slug (`teatro-carlo-felice` → "Teatro Carlo Felice", the same
transformation `cityName` already applies to city slugs), and says nothing is
on. The city must still be recognised, or it is a genuine 404 (R3.2).

*Rejected:* keeping them prerendered and lowering the threshold from three
events to one. It shrinks the problem without solving it — a venue whose events
have all passed still loses its page at the next build, which is the link rot
this project has just spent a day removing.

**Consequence:** SSR pages are invisible to the generated sitemap, so venue URLs
move into a sitemap endpoint of their own, in the shape already used for events
(`sitemap-events.xml`). Only venues that currently have events are listed
(R1.5).

## 3. Gone is 410, not 404 (R2.1, R3.1)

`resolveEvent` returns nothing for two very different cases: an id that was
never ours, and an id whose record has expired. They are distinguishable by
shape — every event id this site mints is 12 lowercase hex characters
(`eventIdOf` → a SHA-256 prefix).

**Chosen:** a well-formed id that resolves to nothing answers `410 Gone` with a
page saying the event is no longer available and linking onward. Anything else
answers `404`.

*Rejected:* a stored tombstone per deleted event. More correct in principle, but
the 15 806 URLs already dead have no tombstone and never will, so it would not
answer the case that actually exists.

*Trade-off accepted:* an id that is well-formed but never existed will answer
410 rather than 404. The chance of guessing a 12-hex-character id is negligible,
and the cost of being wrong is that a crawler drops a URL that was never there.

## 4. One component for "nothing here" (R1.1, R1.2, R1.3, R2.2)

A single `EmptyState` component, given a heading, a sentence and a link onward,
serves all three pages: empty city, empty venue, gone event. The three differ
only in wording, and the wording lives in the UI dictionaries — all five places
a string must be registered (three `.md` dictionaries, the Effect dict schema,
the content-collection zod schema), as this codebase has already been bitten by
missing the last one.

## 5. Status codes are set where the page is rendered

Astro sets `Astro.response.status` in the page frontmatter. The event route
already computes 200/404 there; it gains 410. The venue route always renders
200 once the city is recognised.

## 6. Health checks (R4.1)

Three new assertions in the collector's existing check set, against production:
a city known to be empty answers 200, a known-gone event answers 410, a nonsense
id answers 404. They live beside the checks that already guard the sitemap and
the past-event pages.

## Traceability

| Requirement | Design | Verified by |
| --- | --- | --- |
| R1.1, R1.4 | §1 | `test/places.test.ts`, `e2e/empty-states.spec.ts` |
| R1.2, R1.3 | §2, §4 | `e2e/empty-states.spec.ts` |
| R1.5 | §2 | `e2e/seo-discovery.spec.ts` |
| R2.1, R2.2, R2.3 | §3, §4 | `test/gone-event.test.ts`, `e2e/owner-past-event.spec.ts` |
| R3.1, R3.2 | §3 | `test/gone-event.test.ts`, `e2e/empty-states.spec.ts` |
| R4.1 | §6 | `test/health.test.ts` (collector) |
