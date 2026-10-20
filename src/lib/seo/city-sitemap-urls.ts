import { citiesWithEvents } from '../region/cities-with-events.ts';
import { sitemapRow } from './sitemap-row.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { SitemapUrl } from './sitemap-url.ts';

/**
 * The city feeds that have something in them.
 *
 * The tier between the regions Google keeps and the venue pages it has never
 * fetched: /it/liguria/genova/ is indexed, /it/piemonte/torino/ was crawled and
 * dropped, /it/lombardia/milano/ is unknown. They are worth their row and worth
 * a lastmod, which the generated sitemap never gave them.
 */
export const citySitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] =>
  citiesWithEvents(events).map((place) => sitemapRow(`${place.region}/${place.city}/`, today, site));
