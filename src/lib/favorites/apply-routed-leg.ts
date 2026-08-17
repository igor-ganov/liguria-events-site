import { isTight } from './is-tight.ts';
import type { RoutedLeg } from './planner-types.ts';
import type { Leg, RouteStop } from './route-types.ts';

/** Replace a leg's straight-line estimate with real routing. `tight` is
 *  recomputed here — against the stops' current fixed times and the real
 *  travel time, never taken from the cache. */
export const applyRoutedLeg = (
  leg: Leg,
  from: RouteStop,
  to: RouteStop,
  routed: RoutedLeg,
): Leg => ({
  ...leg,
  meters: routed.meters,
  minutes: routed.minutes,
  tight: isTight(from, to, routed.minutes),
  geometry: routed.geometry,
  real: true,
  transfers: routed.transfers,
  segments: routed.segments,
});
