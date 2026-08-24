import { eventsOfCity } from './events-of-city.ts';
import { eventsOfRegion } from '../region/events-of-region.ts';
import { eventsOfVenue } from './events-of-venue.ts';
import { branch } from '../branch.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Facet } from './city-facets.ts';

/** The venue a feed is narrowed to, when it is. */
export type VenueView = Readonly<{ slug: string; name: string }>;

export type FeedScope = Readonly<{
  region: string;
  city?: string | undefined;
  venue?: VenueView | undefined;
  /** A named narrowing of the city's feed — today, this weekend, free. */
  facet?: Facet | undefined;
  today?: string | undefined;
}>;

/** The events one feed page shows: a region, a city within it, or a single
 *  venue within that city. One function, so the three pages cannot drift. */
const inPlace = (events: readonly CompactEvent[], scope: FeedScope): readonly CompactEvent[] =>
  branch(scope.venue === undefined)(
    () => eventsOfCity(eventsOfRegion(events, scope.region), scope.city),
    () => eventsOfVenue(events, scope.region, scope.city ?? '', scope.venue?.slug ?? ''),
  );

export const feedEvents = (
  events: readonly CompactEvent[],
  scope: FeedScope,
): readonly CompactEvent[] => {
  const here = inPlace(events, scope);
  return [scope.facet]
    .filter((facet): facet is Facet => facet !== undefined)
    .map((facet) => facet.narrow(here, scope.today ?? ''))
    .at(0) ?? here;
};
