import { legBetween } from './leg-between.ts';
import type { Mode, RouteDay, RouteStop } from './route-types.ts';

/** One day of the itinerary: the stops in the order given, plus the leg between
 *  each consecutive pair. */
export const dayWithLegs = (day: string, stops: readonly RouteStop[], mode: Mode): RouteDay => ({
  day,
  stops,
  legs: stops.slice(1).map((stop, index) => legBetween(stops[index]!, stop, mode)),
});
