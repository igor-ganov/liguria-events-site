import { alternateLinks } from './alternate-links.ts';
import { canonicalUrl } from './canonical-url.ts';
import { ENTRY_LOCALE } from '../i18n/entry-locale.ts';
import { venuePath } from '../events/venue-path.ts';
import { venuesOf } from '../events/venues-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { SitemapUrl } from './sitemap-url.ts';

// Three upcoming events: a programme rather than a single night. The corpus
// holds 516 venues with something on and 97 with three, and the smaller number
// is the one worth a crawler's day — every one of those pages has a list on it
// that a city page does not.
const MIN_EVENTS = 3;

/**
 * The venues worth advertising.
 *
 * They were withdrawn on 2026-09-27: 2 553 URLs, none indexed, none fetched,
 * standing in the same queue as the pages Google does read. What changed since
 * is the page — the town in its title, Place markup with its programme, and a
 * link from its city — so a bounded set of them goes back in as a bet that can
 * be checked: 97 pages, and coverage of the template measured per week.
 */
export const venueSitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] =>
  venuesOf(events)
    .filter((venue) => venue.count >= MIN_EVENTS)
    .map((venue) => {
      const path = venuePath(venue.region, venue.city, venue.slug);
      return {
        loc: canonicalUrl(ENTRY_LOCALE, path, site),
        lastmod: today,
        alternates: alternateLinks(path, site),
      };
    });
