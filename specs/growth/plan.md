# Growth plan — dovego.it

Baseline measured 2026-08-22. Every number here came from the live site, the
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

**We cannot see acquisition at all.** No Search Console property, and this
Cloudflare plan does not expose referrer data (`clientRefererHost` is refused).
So today we cannot answer: how many visits come from search, on which queries,
whether the sitemap is being read, or whether any event has ever appeared as a
rich result. Everything below is a hypothesis until that is fixed.

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

Still to do:

- **Search Console and Bing Webmaster Tools** — needs the owner's Google
  account. Until then we are guessing. Submit both sitemaps, watch coverage and
  the rich-result report.
- **Past events must stop 404-ing.** When the corpus prunes an event its page
  dies, and every link ever shared to it dies with it. A past event should
  resolve to a page that says it has passed and points at what is on now.
- Feed and city pages carry no `ItemList` markup; event listings can carry it.

### 2. Landing pages that match how people actually search

The highest-volume queries for this category are time-bound and city-bound:
*cosa fare a Genova questo weekend*, *eventi gratis a Milano oggi*, *cosa fare
stasera a Torino*. We have region, city and calendar-month pages, and nothing
for any of those.

Proposed, in build order:

1. `/{region}/{city}/questo-weekend/` — this weekend, prerendered per city,
   regenerated every build.
2. `/{region}/{city}/oggi/` and `/domani/`.
3. `/{region}/{city}/gratis/` — free events; 173 events already qualify.
4. Category × city: `/{region}/{city}/concerti/`, `/mostre/`, `/mercatini/`.

Each is a real page with its own title, description, `ItemList` markup and an
honest empty state. 85 cities × 4 templates is a lot of pages, so they must be
generated, and thin ones (fewer than N events) must not be generated at all —
an empty page ranking for a city is worse than no page.

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

1. **Search Console + Bing Webmaster**: verify `dovego.it`. I can add the DNS TXT
   record through the Cloudflare API the moment you paste the verification
   string; I cannot log into your Google account.
2. **Telegram channel**: create it and add the bot as an admin.
3. **Analytics decision**: Cloudflare Web Analytics is free, privacy-preserving
   and would give us referrers, which the current plan does not.

## How we will know any of it worked

Not by traffic alone — August distorts everything. The measurements that matter:

| Question | Where it is answered | Today |
| --- | --- | --- |
| Is Google reading the sitemap? | Search Console → Sitemaps | unknown |
| How many event pages are indexed? | Search Console → Pages | unknown |
| Do events show as rich results? | Search Console → Events report | unknown |
| Which queries reach us? | Search Console → Performance | unknown |
| How many visits come from search? | Web Analytics referrers | unknown |
| Are people coming back? | ICS subscribers, Telegram members | 0 |

Every row of "unknown" is the argument for doing step 1's remaining item first.

A 90-day target worth committing to, once measurement exists: event pages
indexed in the four figures, a non-trivial share of visits arriving from search
rather than direct, and a first cohort of calendar subscribers. Setting a
traffic number before we can see where traffic comes from would be theatre.
