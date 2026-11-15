import { facetOf } from './facet-of.ts';
import { hasRealVenue } from './has-real-venue.ts';
import { regionOf } from '../region/region-of.ts';
import { slugify } from '../slugify.ts';
import { venuePath } from './venue-path.ts';
import type { CompactEvent } from './event-schema.ts';

/**
 * The in-site path of an event's venue page, or nothing when there is no such
 * page: the venue is not a place of its own ("various places", the town's
 * name), or its slug is a facet's — `/genova/today/` is the day's events, not
 * a venue called "Today", so a link there would lead somewhere else.
 */
export const venuePagePath = (event: CompactEvent): string | undefined =>
  [event]
    .filter(hasRealVenue)
    .map((found) => ({ found, slug: slugify(found.v ?? '') }))
    .filter(({ slug }) => facetOf(slug) === undefined)
    .map(({ found, slug }) => venuePath(regionOf(found), found.ct ?? '', slug))
    .at(0);
