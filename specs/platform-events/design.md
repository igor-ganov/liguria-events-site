# Design — events made here, not only found here

Satisfies `requirements.md` R1–R6.

## 1. Visibility is a column, not a status (R2, R3)

`events` already carries `origin` (crawler | user) and `status` (published |
held | rejected). Neither can express "anyone with the link, nobody else":
`status` gates *whether it is finished*, and reusing it for *who may see it*
would make a private party indistinguishable from a rejected submission.

**Chosen:** `visibility TEXT NOT NULL DEFAULT 'link'` — `link` | `public`.
Default `link`, so the private case is what happens when nobody chooses.
Crawled rows are backfilled to `public`; they have no author to ask.

The two columns compose, and each combination means something:

| visibility | status | what it is |
| --- | --- | --- |
| link | published | a private invitation, live the moment it is made |
| public | held | waiting for moderation, author-only, as today |
| public | published | in the feed, marked as made here |

*Rejected:* a separate `private_events` table. The event detail page, the
editor, the image upload and the moderation queue all already work on `events`;
a second table would fork every one of them for one boolean.

## 2. One query is the gate (R2.2)

`publishedEvents` is the only path a user's event takes into the public feed —
the feed corpus is the crawler's, augmented from that endpoint. Adding
`AND visibility = 'public'` there closes feed, and the sitemap and RSS builders
read the same helper.

That single point is also why R6 is worth having: it is one `WHERE` clause
between a private invitation and a public listing.

## 3. Link-only pages tell crawlers to leave (R2.3)

The detail route already renders for any resolvable id. A link-only event adds
`<meta name="robots" content="noindex, nofollow">` and omits its canonical from
the sitemap. Links are shared onward and end up in inboxes that get indexed;
`noindex` is what keeps a leak from becoming a search result.

## 4. Made here, and shown to be (R3.3, R4.1)

The compact projection gains `pl: true` for `origin = 'user'`. It is one flag,
so the feed can badge it, the filter bar can offer it, and the sort can use it
without another lookup.

## 5. Priority is a tie-break, not a boost (R4.2, R4.3)

Within a day group, platform events sort first; the day grouping itself is
untouched. A platform event three weeks out must not appear above a concert
tonight — the feed answers "what is on", and a cross-day boost answers
"what did somebody pay us to show", which is a different site.

## 6. After creating, the link (R1.3)

The create flow currently redirects to the event page. That page gains a share
row for a just-made event: the URL, a copy button, and the share control that
already exists. For a link-only event that row is the whole point of the
product, so it is the first thing under the title, not a footer.

## 7. Bounds (R5.3)

A per-account daily cap, counted in D1 from `created_at`. Cheap, and it is the
number an abusive account hits first.

## Traceability

| Requirement | Design | Verified by |
| --- | --- | --- |
| R1.1 | (shipped) | `e2e/owner-submit-open.spec.ts` |
| R1.2, R1.3 | §1, §6 | `e2e/owner-platform-events.spec.ts` |
| R2.1–R2.3 | §1, §2, §3 | `test/event-visibility.test.ts`, e2e |
| R3.1–R3.3 | §1, §4 | `test/event-visibility.test.ts` |
| R4.1–R4.3 | §4, §5 | `test/feed-platform-first.test.ts` |
| R5.3 | §7 | `test/create-quota.test.ts` |
| R6.1 | §2 | collector `test/health.test.ts` |
