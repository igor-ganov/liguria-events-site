import { eventAvailableOn } from '../../lib/favorites/build-route.ts';
import { isDefined } from '../../lib/is-defined.ts';
import type { DayGroup, RouteStop } from '../../lib/favorites/build-route.ts';

/** Favourites that can be added to a given day: available that day, present in
 *  the corpus, and not already placed anywhere in the route. */
export const addableEvents = (
  groups: readonly DayGroup[],
  favourites: ReadonlySet<string>,
  byId: ReadonlyMap<string, RouteStop>,
  day: string,
): readonly RouteStop[] => {
  const placed = new Set(groups.flatMap((group) => group.ids));
  return [...favourites]
    .map((id) => byId.get(id))
    .filter(isDefined)
    .filter((event) => !placed.has(event.id) && eventAvailableOn(event, day));
};
