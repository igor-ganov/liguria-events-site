// Progressive upgrade of a route's straight-line legs to real walk/transit
// routing from Transitous/MOTIS (via the shared italian-transport-core package,
// which ingests the AMT GTFS feed). The itinerary renders instantly with the
// haversine estimate, then this replaces each leg's distance/time/geometry with
// the real routed values where the planner can serve them. The cached variant
// (for the owner editor, which re-renders on every edit) lives alongside.
import { defaultPlanner } from './default-planner.ts';
import { enrichLeg } from './enrich-leg.ts';
import type { Planner } from './planner-types.ts';
import type { Mode, RouteDay } from './route-types.ts';

export type { LegPair, Planner, RoutedLeg } from './planner-types.ts';
export { applyLegCache } from './apply-leg-cache.ts';
export { fillLegCache } from './fill-leg-cache.ts';
export { legKey } from './leg-key.ts';

/** Upgrade a route's legs to real routing. Legs the planner can't serve
 *  (offline, no service, or driving — MOTIS has no car routing) keep their
 *  estimate, so the route always renders. Returns a new day array. */
export const enrichDays = async (
  days: readonly RouteDay[],
  mode: Mode,
  plan: Planner = defaultPlanner,
): Promise<readonly RouteDay[]> =>
  Promise.all(
    days.map(async (day) => ({
      ...day,
      legs: await Promise.all(
        day.legs.map((leg, index) =>
          enrichLeg(leg, day.stops[index]!, day.stops[index + 1]!, mode, plan),
        ),
      ),
    })),
  );
