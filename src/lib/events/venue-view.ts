import { venuesOf } from './venues-of.ts';
import type { CompactEvent } from './event-schema.ts';
import type { VenueView } from './feed-events.ts';

// A slug read back as a name: `teatro-carlo-felice` → `Teatro Carlo Felice`.
// The same transformation `cityName` already applies to a city slug.
const nameFromSlug = (slug: string): string =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * The venue a request is about.
 *
 * A venue with events is named as its events name it. A venue with nothing on
 * is still a venue: it gets its name back from the slug and a page saying
 * nothing is on, because 404 would be the site claiming the place is not real.
 */
export const venueView = (
  events: readonly CompactEvent[],
  region: string,
  city: string,
  slug: string,
): VenueView =>
  venuesOf(events)
    .filter((venue) => venue.region === region && venue.city === city && venue.slug === slug)
    .map((venue) => ({ slug: venue.slug, name: venue.name }))
    .at(0) ?? { slug, name: nameFromSlug(slug) };
