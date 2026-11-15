import { venuePagePath } from '../events/venue-page-path.ts';
import { venuesOf } from '../events/venues-of.ts';
import { cityName } from '../region/city-name.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** A venue with a page, with the events that make it one. */
export type VenueGroup = Readonly<{ id: string; region: string; name: string; city: string; path: string; events: readonly CompactEvent[] }>;

/** Every venue that has a page of its own, with its events: the venue list is
 *  the site's own (venuesOf), and its page path is what venuePagePath says, so
 *  a suggestion can never lead to a page the site does not serve. */
export const venueGroups = (events: readonly CompactEvent[]): readonly VenueGroup[] => {
  const byPath = new Map<string, CompactEvent[]>();
  events.forEach((event) =>
    [venuePagePath(event)].forEach((path) => byPath.set(path ?? '', [...(byPath.get(path ?? '') ?? []), event])),
  );
  return venuesOf(events).flatMap((venue) => {
    const path = `${venue.region}/${venue.city}/${venue.slug}/`;
    return [byPath.get(path) ?? []]
      .filter((found) => found.length > 0)
      .map((found) => ({ id: `venue:${venue.region}/${venue.city}/${venue.slug}`, region: venue.region, name: venue.name, city: cityName(venue.city), path, events: found }));
  });
};
