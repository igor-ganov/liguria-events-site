import { sortByOrder } from './sort-by-order.ts';
import type { DayGroup, RouteDay } from '../../lib/favorites/build-route.ts';

/** The day groups of a generated route, each day's stops put back into the
 *  order the user dragged them into (kept in localStorage), so a regenerate
 *  does not undo a tweak. */
export const groupsInOrder = (
  days: readonly RouteDay[],
  order: Readonly<Record<string, readonly string[]>>,
): readonly DayGroup[] =>
  days.map((day) => ({
    day: day.day,
    ids: sortByOrder(day.stops.map((stop) => stop.id), order[day.day]),
  }));
