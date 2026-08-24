import type { Facet } from '../../../lib/events/city-facets.ts';
import type { Locale } from '../../../lib/i18n/locales.ts';
import type { VenueView } from '../../../lib/events/feed-events.ts';

/**
 * What a feed page is about: a region, a city inside it, and then either one
 * venue or one facet of that city — today, this weekend, free.
 *
 * `today` is passed in rather than read here so a server-rendered facet page
 * computes it per request: the site rebuilds every six hours, and a page built
 * at 23:23 would otherwise call yesterday's events today until morning.
 */
export type FeedProps = Readonly<{
  lang: Locale;
  region: string;
  city?: string | undefined;
  venue?: VenueView | undefined;
  facet?: Facet | undefined;
  today?: string | undefined;
}>;
