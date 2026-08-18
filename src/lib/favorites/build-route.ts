// The route pipeline's entry point. Its pieces — ordering, grouping, legs,
// distances — each live in their own module; this file composes them and stays
// the stable import surface the route UI, PDF and enrichment already use.
import { dayWithLegs } from './day-with-legs.ts';
import { groupStopsByDay } from './group-stops-by-day.ts';
import { orderDay } from './order-day.ts';
import { stopsInRange } from './stops-in-range.ts';
import type { DateRange, Mode, RouteDay, RouteStop } from './route-types.ts';

export type { Coords, DateRange, DayGroup, Leg, LegSegment, Mode, RouteDay, RouteStop } from './route-types.ts';
export { eventAvailableOn } from './event-available-on.ts';
export { haversineMeters } from '../geo/haversine-meters.ts';
export { mapsDirUrl } from './maps-dir-url.ts';
export { minutesOf } from './minutes-of.ts';
export { poiToStop } from './poi-to-stop.ts';
export { routeFromGroups } from './route-from-groups.ts';
export { travelMinutesBetween } from './travel-minutes-between.ts';

/** Build the itinerary: one section per day, each with its stops ordered and
 *  the legs between them. A `range` limits the trip to events overlapping the
 *  window (ongoing events clamped to the trip start); without it, all events
 *  are scheduled on their own start day. */
export const buildRoute = (
  events: readonly RouteStop[],
  mode: Mode,
  range?: DateRange,
): readonly RouteDay[] => {
  const byDay = groupStopsByDay(stopsInRange(events, range), range);
  return [...byDay.keys()]
    .toSorted()
    .map((day) => dayWithLegs(day, orderDay(byDay.get(day) ?? []), mode));
};
