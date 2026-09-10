import { alternateLinks } from './alternate-links.ts';
import { canonicalUrl } from './canonical-url.ts';
import { facetSitemapUrls } from './facet-sitemap-urls.ts';
import { LOCALES } from '../i18n/locales.ts';
import { venuePath } from '../events/venue-path.ts';
import { venuesOf } from '../events/venues-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { SitemapUrl } from './event-sitemap-urls.ts';

/**
 * The pages that stay: a venue, a city's today, a city's free things.
 *
 * Server-rendered, so the generated sitemap cannot see them, and separate from
 * the events because they change on a different clock — a venue is a venue
 * next year. Only venues with something on are listed: an empty page should be
 * reachable, not advertised.
 */
export const placeSitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] => [
  ...venuesOf(events).flatMap((venue) => {
    const path = venuePath(venue.region, venue.city, venue.slug);
    return LOCALES.map((lang) => ({
      loc: canonicalUrl(lang, path, site),
      lastmod: today,
      alternates: alternateLinks(path, site),
    }));
  }),
  ...facetSitemapUrls(events, today, site),
];
