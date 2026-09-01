import { alternateLinks } from './alternate-links.ts';
import { canonicalUrl } from './canonical-url.ts';
import { eventPath } from '../event-path.ts';
import { isUpcoming } from '../events/is-upcoming.ts';
import { LOCALES } from '../i18n/locales.ts';
import { venuePath } from '../events/venue-path.ts';
import { facetSitemapUrls } from './facet-sitemap-urls.ts';
import { venuesOf } from '../events/venues-of.ts';
import type { AlternateLink } from './alternate-links.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** One sitemap entry: a page, when it last changed, and its other languages. */
export type SitemapUrl = Readonly<{
  loc: string;
  lastmod: string;
  alternates: readonly AlternateLink[];
}>;

const stampOf = (event: CompactEvent, fallback: string): string =>
  [event.cr]
    .filter((seconds): seconds is number => seconds !== undefined)
    .map((seconds) => new Date(seconds * 1000).toISOString().slice(0, 10))
    .at(0) ?? fallback;

/**
 * Every event page, in every language.
 *
 * The pages are server-rendered, so the sitemap integration — which walks the
 * prerendered routes — cannot see a single one of them. For a site whose pages
 * are worth reading for two weeks, waiting for a crawler to find them by
 * following links is the difference between being in Google and not.
 *
 * Past events are left out: their pages no longer resolve once the corpus has
 * pruned them, and a sitemap full of 404s is worse than a smaller one.
 */
export const eventSitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] => [
  ...events.filter(isUpcoming(today)).flatMap((event) =>
    LOCALES.map((lang) => ({
      loc: canonicalUrl(lang, eventPath(event), site),
      lastmod: stampOf(event, today),
      alternates: alternateLinks(eventPath(event), site),
    })),
  ),
  // Venue pages are server-rendered too, for the same reason — a venue with
  // nothing on right now is still a venue — so they are invisible to the
  // generated sitemap and belong here. Only venues that currently have events
  // are listed: an empty page should be reachable, not advertised.
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
