// Progressive upgrade of a route's straight-line legs to real walk/transit
// routing from Transitous/MOTIS (via the shared italian-transport-core package,
// which ingests the AMT GTFS feed). The itinerary renders instantly with the
// haversine estimate, then this replaces each leg's distance/time/geometry with
// the real routed values where the planner can serve them.
import { planBest } from 'italian-transport-core';
import type { BestLeg, Place, TravelMode } from 'italian-transport-core';
import type { Leg, Mode, RouteDay, RouteStop } from './build-route.ts';
import { minutesOf } from './build-route.ts';

export type Planner = (from: Place, to: Place, mode: TravelMode) => Promise<BestLeg | undefined>;

const defaultPlanner: Planner = planBest;

const minutesFromSec = (sec: number): number => Math.max(1, Math.round(sec / 60));

const upgrade = (leg: Leg, from: RouteStop, to: RouteStop, best: BestLeg): Leg => {
  const minutes = minutesFromSec(best.durationSec);
  const depart = minutesOf(from.h);
  const arrive = minutesOf(to.h);
  const tight = depart !== undefined && arrive !== undefined && depart + minutes > arrive;
  return { ...leg, meters: best.meters, minutes, tight, geometry: best.geometry, real: true, transfers: best.transfers };
};

const enrichLeg = async (
  leg: Leg,
  from: RouteStop,
  to: RouteStop,
  mode: Mode,
  plan: Planner,
): Promise<Leg> => {
  const a = from.g;
  const b = to.g;
  if (!a || !b) return leg;
  const best = await plan({ name: from.t ?? '', lat: a[0], lon: a[1] }, { name: to.t ?? '', lat: b[0], lon: b[1] }, mode);
  return best ? upgrade(leg, from, to, best) : leg;
};

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
        day.legs.map((leg, i) => enrichLeg(leg, day.stops[i]!, day.stops[i + 1]!, mode, plan)),
      ),
    })),
  );
