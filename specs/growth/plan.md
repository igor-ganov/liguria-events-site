# Growth plan — dovego.it

Baseline measured 2026-08-22; Search Console read 2026-08-23. Every number here came from the live site, the
Cloudflare API or the corpus; none of it is estimated. Revisit the baseline
before arguing about what to do next.

## Where we actually are

**Traffic** (Cloudflare, zone `dovego.it`, unique IPs per day):

| Period | Requests/day | Page views/day | Unique IPs/day |
| --- | ---: | ---: | ---: |
| Late July | 28 000 – 69 000 | 12 000 – 44 000 | 2 450 – 2 880 |
| Last 7 days | 4 300 – 19 000 | 800 – 1 900 | 900 – 1 900 |

Read this carefully before treating it as a collapse. The request drop is
largely our own doing: eager JavaScript went from 1.14 MB to 35 KB, the map
corpus from 2.98 MB to 634 KB, and place shards are no longer fetched until you
zoom in. Far fewer requests per visit is the point. The *unique IP* decline
(≈2 800 → ≈1 100) is the number that is not explained by that, and August in
Italy is a holiday month — so it is a signal to watch, not yet a conclusion.

**What Search Console says** (checked 2026-08-23 — the property
`sc-domain:dovego.it` exists and is verified; an earlier draft of this document
claimed it did not, which was wrong):

| | |
| --- | ---: |
| Clicks, last 90 days | **1** |
| Impressions | 374 |
| Average position | **59.7** |
| Pages indexed | 3 082 |
| Pages NOT indexed | **17 196** |
| Event rich results valid / errors | 52 / 0 |

Two numbers explain the site's whole search situation.

**15 806 of the non-indexed pages are 404s** — 92% of them. They are
`/event/<id>/` pages of events that have happened. The cause is a one-line
policy in the collector: every event record is written to KV with a TTL of
three days past its end date, so three days after an event the record
evaporates and its page dies. Every link ever shared to a dovego event is now
dead, and Google has crawled 15 806 of those corpses. A site that is mostly
404 does not look like a site worth ranking.

**Average position 59.7** — page six. We are indexed and not competitive.

The queries we do surface for are worth reading closely, because they are not
what this document previously assumed:

    acquario di genova ferragosto      45 impressions
    acquario genova ferragosto         40
    acquario eventi genova             18
    museo delle illusioni genova       12
    la pelota eventi milano             9
    mostra delle illusioni genova       6

Not "cosa fare a Genova questo weekend". **Venue plus time**, and **venue plus
"eventi"**. People search for a place they already have in mind and want to know
what is on there. We hold a venue on almost every event and have never built a
page for one.

**Content**: 1 233 events, 20 regions, 85 cities, 3 languages. 1 175 have
coordinates, 974 have an image, 173 are free, 71 are marked hidden gems.
Concentration: Lombardia 344, Liguria 192, Toscana 177, Lazio 136, Veneto 114.

**Channels**: a Telegram bot exists; no channel. An ICS feed exists
(`/calendar.ics` on the collector); nothing invites anyone to subscribe. No
social accounts. No inbound links to speak of.

## The bets, in order of expected return

### 1. Be findable and be shown — Google Events

Done (2026-08-22):

- `sitemap-events.xml`: 3 591 entries (1 197 upcoming events × 3 locales) with
  `lastmod` and hreflang. Before this the sitemap held 1 520 URLs and **not one
  event page** — event pages are server-rendered, so the generated sitemap could
  never see them.
- `Event` JSON-LD brought up to what the rich result requires: `location` always
  present with a `PostalAddress`, real start times with the Europe/Rome offset,
  offers pointing at the ticket vendor, `eventStatus` / `eventAttendanceMode` /
  `url`, and a `subEvent` per evening for containers.
- `Google-Extended` no longer disallowed, so the site can appear in AI Overviews
  and Gemini's grounded answers.

Also done (2026-08-23):

- **The link rot is stopped.** Every event record was written to KV with a TTL
  of three days past the event, so its page died and took every shared link with
  it. An archived copy now lives 400 days, the collector serves it at
  `GET /event/<id>`, and the page renders "this event has passed" with a way
  through to what is on now — in all three locales, through one shared resolver.
- **`sitemap-events.xml` submitted** to Search Console; the index sitemap had
  been submitted since 6 August and reports 1 469 pages found.
- **The hreflang we were wrong about is fixed.** A page now declares only the
  languages it is actually built in.
- **Health checks and monitoring**, so none of the above rots quietly: 13 checks
  at `GET /health` on the collector, rendered worst-first at the top of
  admin.dovego.it, with a Telegram message when the verdict changes. It found
  the broken hreflang on its first run.

Still to do:

- **Fill the rich-result warnings** Search Console lists against the 52 valid
  events: `performer` and `organizer` missing on all 52, and `price` /
  `priceCurrency` / `validFrom` missing on 18. The collector already stores the
  raw price text (`priceInfo`); parsing a number out of it would complete the
  offer. Warnings do not block the rich result, but they narrow which queries it
  can answer.

### 2. Landing pages, aimed at the demand we can actually see

The queries above say the demand is venue-anchored. Build order revised:

1. ~~**Venue pages**~~ — **done 2026-08-23**: `/{region}/{city}/{venue}/` in all
   three languages, 133 venues with at least three events each, titled "What's
   on at <venue>" and opening with the venue rather than a filter bar. Venues
   below the threshold get no page, two spellings of one theatre become one, and
   names that are not places (the city's own name, "luoghi vari in città") are
   dropped.
2. `/{region}/{city}/questo-weekend/`, `/oggi/`, `/domani/` — the time-bound
   pages. Still worth building; just not first, since nothing in the data yet
   shows us reaching those searchers.
3. `/{region}/{city}/gratis/` — 173 events qualify.
4. Category × city: `/concerti/`, `/mostre/`, `/mercatini/`.

Each needs its own title, description, `ItemList` markup and an honest empty
state — and must not be generated at all when it would be thin. An empty page
ranking for a city is worse than no page.

### 3. Distribution we already half-own

- **Telegram channel** per region, fed by the existing bot: one post per
  interesting event, one weekly digest. The bot's digest code already exists.
- **ICS subscription** promoted on every city page: "add this city's events to
  your calendar". A calendar subscription is the stickiest retention primitive
  this category has — it survives without the reader ever visiting again.
- **RSS** per city and category, for aggregators and for Telegram/Discord bots
  run by other people.

### 4. Links, which is what actually moves rankings

Nothing above outranks an established competitor without links. Realistic
sources, cheapest first: comuni and pro-loco sites that already publish event
lists and welcome an aggregator link; venue pages (we link to them — ask for the
return link); local subreddits and Facebook groups where "what's on this
weekend" is asked weekly; tourism boards' partner pages.

### 5. Social, once there is something to show

Event listings are visual and we hold 974 images. Instagram/TikTok reels of
"this weekend in Genoa" are the native format. This is a real time cost with a
slow payoff — worth starting only once 1–3 are running.

## What needs the owner, not me

1. **Bing Webmaster Tools**: nothing exists there. Google's property is verified
   and now has both sitemaps; Bing is a second, cheap source of the same
   long-tail traffic. I can add the DNS TXT through the Cloudflare API once you
   paste the verification string.
2. **Telegram channel**: create it and add the bot as an admin.
3. **Analytics decision**: Cloudflare Web Analytics is free, privacy-preserving
   and would give us referrers, which the current plan does not.

## How we will know any of it worked

Not by traffic alone — August distorts everything. The measurements that matter:

| Question | Where it is answered | 2026-08-23 |
| --- | --- | --- |
| Is Google reading the sitemaps? | Search Console → Sitemaps | index: yes, 1 469 found. events: submitted today |
| How many pages are indexed? | Search Console → Pages | 3 082 indexed, 17 196 not |
| How many of those are dead? | Search Console → Pages | **15 806 are 404** |
| Do events show as rich results? | Search Console → Events | 52 valid, 0 errors |
| Which queries reach us? | Search Console → Performance | 374 impressions, position 59.7 |
| How many visits come from search? | Web Analytics referrers | still unknown |
| Are people coming back? | ICS subscribers, Telegram members | 0 |

The first number to move is 15 806. Everything else in this document competes
for attention with a site that answers most of its own URLs with "gone".

A 90-day target worth committing to: 404s down to the low hundreds, indexed
pages up rather than down as the events sitemap is read, average position out of
the fifties on at least the venue queries we already appear for, and a first
cohort of calendar subscribers. A traffic number is not yet worth setting —
we still cannot see how much of the traffic we have comes from search.
