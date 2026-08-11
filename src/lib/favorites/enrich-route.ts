// Progressive upgrade of a route's straight-line legs to real walk/transit
// routing from Transitous/MOTIS (via the shared italian-transport-core package,
// which ingests the AMT GTFS feed). The itinerary renders instantly with the
// haversine estimate, then this replaces each leg's distance/time/geometry with
// the real routed values where the planner can serve them.
import { planBest } from 'italian-transport-core';
import type { BestLeg, Place, TravelMode } from 'italian-transport-core';
import type { Leg, LegSegment, Mode, RouteDay, RouteStop } from './build-route.ts';
import { minutesOf } from './build-route.ts';

export type Planner = (from: Place, to: Place, mode: TravelMode) => Promise<BestLeg | undefined>;

const defaultPlanner: Planner = planBest;

const minutesFromSec = (sec: number): number => Math.max(1, Math.round(sec / 60));

// The multimodal breakdown (walk → bus → walk) with each part's mode, line,
// destination and minutes — for a compact per-part display in the itinerary.
const segmentsOf = (best: BestLeg): readonly LegSegment[] =>
  best.legs.map((leg) => ({
    mode: leg.mode,
    ...(leg.line ? { line: leg.line } : {}),
    ...(leg.to.name ? { to: leg.to.name } : {}),
    minutes: minutesFromSec(leg.durationSec),
  }));

const upgrade = (leg: Leg, from: RouteStop, to: RouteStop, best: BestLeg): Leg => {
  const minutes = minutesFromSec(best.durationSec);
  const depart = minutesOf(from.h);
  const arrive = minutesOf(to.h);
  const tight = depart !== undefined && arrive !== undefined && depart + minutes > arrive;
  return { ...leg, meters: best.meters, minutes, tight, geometry: best.geometry, real: true, transfers: best.transfers, segments: segmentsOf(best) };
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

/* ── cached variant (for the owner editor, which re-renders on every edit) ── */

// The routing result for one origin→destination pair, cached so reorders and
// drags reuse it instead of re-hitting Transitous. `tight` is deliberately not
// cached — it is recomputed against the current fixed times on apply.
export interface RoutedLeg {
  readonly meters: number;
  readonly minutes: number;
  readonly geometry: readonly (readonly [number, number])[];
  readonly transfers: number;
  readonly segments: readonly LegSegment[];
}

/** Cache key for a directed pair under a travel mode. */
export const legKey = (fromId: string, toId: string, mode: Mode): string => `${fromId}|${toId}|${mode}`;

const routedFromBest = (best: BestLeg): RoutedLeg => ({
  meters: best.meters,
  minutes: minutesFromSec(best.durationSec),
  geometry: best.geometry,
  transfers: best.transfers,
  segments: segmentsOf(best),
});

const applyRouted = (leg: Leg, from: RouteStop, to: RouteStop, routed: RoutedLeg): Leg => {
  const depart = minutesOf(from.h);
  const arrive = minutesOf(to.h);
  const tight = depart !== undefined && arrive !== undefined && depart + routed.minutes > arrive;
  return { ...leg, meters: routed.meters, minutes: routed.minutes, tight, geometry: routed.geometry, real: true, transfers: routed.transfers, segments: routed.segments };
};

/** Synchronously apply whatever real routing is already cached to a freshly
 *  built day array. Pairs with no cached routing keep their estimate. A cache
 *  entry of `undefined` means "looked up, none available" (do not refetch). */
export const applyLegCache = (
  days: readonly RouteDay[],
  mode: Mode,
  cache: ReadonlyMap<string, RoutedLeg | undefined>,
): readonly RouteDay[] =>
  days.map((day) => ({
    ...day,
    legs: day.legs.map((leg, i) => {
      const from = day.stops[i]!;
      const to = day.stops[i + 1]!;
      const routed = cache.get(legKey(from.id, to.id, mode));
      return routed ? applyRouted(leg, from, to, routed) : leg;
    }),
  }));

/** Fetch real routing for any pair not yet in the cache and store it (storing
 *  `undefined` for pairs the planner can't serve, so they are not refetched).
 *  Resolves true when at least one real leg was newly added — the caller then
 *  re-renders to show it. */
export const fillLegCache = async (
  days: readonly RouteDay[],
  mode: Mode,
  cache: Map<string, RoutedLeg | undefined>,
  plan: Planner = defaultPlanner,
): Promise<boolean> => {
  const pending = new Map<string, { readonly from: RouteStop; readonly to: RouteStop }>();
  for (const day of days) {
    day.legs.forEach((_leg, i) => {
      const from = day.stops[i]!;
      const to = day.stops[i + 1]!;
      const key = legKey(from.id, to.id, mode);
      if (!cache.has(key) && !pending.has(key)) pending.set(key, { from, to });
    });
  }
  if (pending.size === 0) return false;
  const results = await Promise.all(
    [...pending].map(async ([key, { from, to }]) => {
      const a = from.g;
      const b = to.g;
      if (!a || !b) return { key, routed: undefined };
      const best = await plan({ name: from.t ?? '', lat: a[0], lon: a[1] }, { name: to.t ?? '', lat: b[0], lon: b[1] }, mode);
      return { key, routed: best ? routedFromBest(best) : undefined };
    }),
  );
  let added = false;
  for (const { key, routed } of results) {
    cache.set(key, routed);
    if (routed) added = true;
  }
  return added;
};
