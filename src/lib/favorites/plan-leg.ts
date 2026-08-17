import { isDefined } from '../is-defined.ts';
import { bothCoords } from './both-coords.ts';
import { routedFromBest } from './routed-from-best.ts';
import type { Planner, RoutedLeg } from './planner-types.ts';
import type { Mode, RouteStop } from './route-types.ts';

/** Ask the planner for real routing between two stops. A stop without
 *  coordinates is never looked up, and a pair the planner can't serve
 *  (offline, no service, or driving — MOTIS has no car routing) resolves to
 *  undefined, leaving the caller's estimate in place. */
export const planLeg = async (
  plan: Planner,
  from: RouteStop,
  to: RouteStop,
  mode: Mode,
): Promise<RoutedLeg | undefined> => {
  const best = await Promise.all(
    bothCoords(from, to).map(({ a, b }) =>
      plan({ name: from.t ?? '', lat: a[0], lon: a[1] }, { name: to.t ?? '', lat: b[0], lon: b[1] }, mode),
    ),
  );
  return best.filter(isDefined).map(routedFromBest).at(0);
};
