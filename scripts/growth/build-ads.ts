/**
 * Build the Google Ads import files from the live corpus.
 *
 *   bun run scripts/growth/build-ads.ts [outDir]
 *
 * 110 cities and 130-odd venues is not a spreadsheet anybody keeps by hand, and
 * the set changes every crawl. Everything here comes from what the site can
 * actually show today: a place with nothing on gets no ad, because paying to
 * send somebody to an empty page is worse than not bidding at all.
 */
import { Effect } from 'effect';
import { cityAdGroup } from './city-ad-group.ts';
import { venueAdGroup } from './venue-ad-group.ts';
import { adsCsv, keywordsCsv, negativesCsv } from './ads-csv.ts';
import { NEGATIVE_KEYWORDS } from './negatives.ts';
import { cityName } from '../../src/lib/region/city-name.ts';
import { venuesOf } from '../../src/lib/events/venues-of.ts';
import { isUpcoming } from '../../src/lib/events/is-upcoming.ts';
import { loadEvents } from '../../src/data/load-events.ts';
import type { AdGroup } from './ad-group.ts';
import type { CompactEvent } from '../../src/lib/events/event-schema.ts';

const SITE = 'https://dovego.it/it';
const EVENTS_URL = process.env.EVENTS_URL ?? 'https://liguria-events-bot.igor-ganov.workers.dev/events.json';
const PLACES_URL = process.env.PLACES_URL ?? 'https://liguria-events-bot.igor-ganov.workers.dev/places.json';

const today = new Date().toISOString().slice(0, 10);

const cityGroups = (events: readonly CompactEvent[], places: Readonly<Record<string, readonly string[]>>) =>
  Object.entries(places).flatMap(([region, cities]) =>
    cities.map((city) =>
      cityAdGroup({
        name: cityName(city),
        url: `${SITE}/${region}/${city}/`,
        events: events.filter((event) => event.ct === city).length,
      }),
    ),
  );

const venueGroups = (events: readonly CompactEvent[]) =>
  venuesOf(events).map((venue) =>
    venueAdGroup({
      name: venue.name,
      city: cityName(venue.city),
      url: `${SITE}/${venue.region}/${venue.city}/${venue.slug}/`,
      events: venue.count,
    }),
  );

const main = async (): Promise<void> => {
  const outDir = process.argv[2] ?? 'out/ads';
  const [payload, places] = await Promise.all([
    Effect.runPromise(loadEvents(EVENTS_URL)),
    fetch(PLACES_URL).then((res): Promise<Readonly<Record<string, readonly string[]>>> => res.json()),
  ]);
  const events = payload.events.filter(isUpcoming(today));
  const groups: readonly AdGroup[] = [...cityGroups(events, places), ...venueGroups(events)].filter(
    (group): group is AdGroup => group !== undefined,
  );
  await Bun.write(`${outDir}/keywords.csv`, keywordsCsv(groups));
  await Bun.write(`${outDir}/ads.csv`, adsCsv(groups));
  await Bun.write(`${outDir}/negatives.csv`, negativesCsv(NEGATIVE_KEYWORDS));
  const keywords = groups.reduce((sum, group) => sum + group.keywords.length * 2, 0);
  console.log(`${groups.length} ad groups, ${keywords} keywords, ${NEGATIVE_KEYWORDS.length} negatives → ${outDir}`);
};

await main();
