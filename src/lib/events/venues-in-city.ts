import { venuePath } from './venue-path.ts';
import { venuesOf } from './venues-of.ts';
import type { CompactEvent } from './event-schema.ts';

/** A venue of one city, with the page it has. */
export type CityVenue = Readonly<{ name: string; slug: string; count: number; path: string }>;

/**
 * The venues of one city, busiest first.
 *
 * For the city page to link them. Of 96 event pages sampled in a week, 17 were
 * in the index: they are reachable from a feed that scrolls and from a sitemap,
 * and from almost nothing else — while the queries that reach this site name
 * venues. A list of links is how a crawler walks from a page it keeps to the
 * pages it does not.
 */
export const venuesInCity = (
  events: readonly CompactEvent[],
  region: string,
  city: string,
): readonly CityVenue[] =>
  venuesOf(events)
    .filter((venue) => venue.region === region && venue.city === city)
    .map((venue) => ({
      name: venue.name,
      slug: venue.slug,
      count: venue.count,
      path: venuePath(venue.region, venue.city, venue.slug),
    }));
