import { eventsOfRegion } from '../region/events-of-region.ts';
import { monthsAhead } from '../calendar/months-ahead.ts';
import { regionsOf } from '../region/regions-of.ts';
import { sitemapRow } from './sitemap-row.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { SitemapUrl } from './sitemap-url.ts';

// The pages a region has beside its feed. Both are thin for most regions and
// both are the only path to the place and landmark detail pages, which nothing
// else advertises.
const SUB_PAGES = ['calendar/', 'landmarks/', 'places/'];

/**
 * A region's own pages: the feed, its calendar and the months still to come.
 *
 * Every region has a page, including the empty ones, so the map of Italy the
 * site presents has no holes in it. An empty one is not offered to a search
 * engine: the facet sitemap has applied that rule since September, and this is
 * the same rule one tier up.
 */
export const regionSitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] =>
  regionsOf(events)
    .filter((region) => region.count > 0)
    .flatMap((region) => [
      sitemapRow(`${region.slug}/`, today, site),
      ...SUB_PAGES.map((page) => sitemapRow(`${region.slug}/${page}`, today, site)),
      ...monthsAhead(eventsOfRegion(events, region.slug), today).map((month) =>
        sitemapRow(`${region.slug}/calendar/${month}/`, today, site),
      ),
    ]);
