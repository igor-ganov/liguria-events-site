import { cityName } from '../region/city-name.ts';
import { PROGRAMME_MIN } from '../seo/programme-min.ts';
import { venuePath } from './venue-path.ts';
import { venuesOf } from './venues-of.ts';
import type { CityVenue } from './venues-in-city.ts';
import type { CompactEvent } from './event-schema.ts';

/**
 * The venues of one region with a programme, busiest first, each named with its
 * town.
 *
 * For the region feed to link them. The city page has linked its venues since
 * the 4th of October and not one venue page has been fetched since: the city
 * pages are themselves the tier Google barely reads — one of three sampled is
 * indexed — so a venue page sat two hops from anything read often, behind a hop
 * read once a month. The region feeds are the tier that is kept and recrawled,
 * which makes them where a path to the long tail has to start.
 */
export const venuesInRegion = (
  events: readonly CompactEvent[],
  region: string,
): readonly CityVenue[] =>
  venuesOf(events)
    .filter((venue) => venue.region === region && venue.count >= PROGRAMME_MIN)
    .map((venue) => ({
      name: venue.name,
      slug: venue.slug,
      count: venue.count,
      path: venuePath(venue.region, venue.city, venue.slug),
      town: cityName(venue.city),
    }));
