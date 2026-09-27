import { alternateLinks } from './alternate-links.ts';
import { canonicalUrl } from './canonical-url.ts';
import { citiesWithEvents } from '../region/cities-with-events.ts';
import { ENTRY_LOCALE } from '../i18n/entry-locale.ts';
import { FACETS } from '../events/city-facets.ts';
import { feedEvents } from '../events/feed-events.ts';
import { venuePath } from '../events/venue-path.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { SitemapUrl } from './sitemap-url.ts';

/**
 * The facet pages worth advertising: a city's today, tomorrow, this weekend and
 * free, listed only while they actually have something in them.
 *
 * The pages themselves exist for every recognised city and answer 200 with an
 * honest empty state — reachable, but an empty page is not worth offering to a
 * search engine. One locale each, for the reason upcomingSitemapUrls gives.
 */
export const facetSitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] =>
  citiesWithEvents(events).flatMap((place) =>
    FACETS.filter(
      (facet) =>
        feedEvents(events, { region: place.region, city: place.city, facet, today }).length > 0,
    ).map((facet) => {
      const path = venuePath(place.region, place.city, facet.slug);
      return {
        loc: canonicalUrl(ENTRY_LOCALE, path, site),
        lastmod: today,
        alternates: alternateLinks(path, site),
      };
    }),
  );
