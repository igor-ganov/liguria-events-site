import { branch } from '../branch.ts';
import { isDefined } from '../is-defined.ts';
import { haversineMeters } from './haversine-meters.ts';
import { minutesOf } from './minutes-of.ts';
import type { Coords, RouteStop } from './route-types.ts';

const FAR = Number.POSITIVE_INFINITY;

const isTimed = (stop: RouteStop): boolean => minutesOf(stop.h) !== undefined;

const startMinutes = (stop: RouteStop): number => minutesOf(stop.h) ?? 0;

// A stop with no coordinates sorts last — it cannot pull the chain anywhere.
const distance = (from: Coords, stop: RouteStop): number =>
  [stop.g].filter(isDefined).map((to) => haversineMeters(from, to)).at(0) ?? FAR;

// Without an anchor every candidate is equally close (0), so the stable sort
// leaves the pool order alone — which is exactly "no point placed yet → take
// the first one".
const gapFrom =
  (anchor: Coords | undefined) =>
  (stop: RouteStop): number =>
    [anchor].filter(isDefined).map((from) => distance(from, stop)).at(0) ?? 0;

const lastCoords = (stops: readonly RouteStop[]): Coords | undefined =>
  stops.map((stop) => stop.g).filter(isDefined).at(-1);

// Index of the pool entry nearest the chain's end; ties keep pool order.
const nearestIndex = (ordered: readonly RouteStop[], pool: readonly RouteStop[]): number => {
  const gap = gapFrom(lastCoords(ordered));
  return (
    pool
      .map((stop, index) => ({ index, gap: gap(stop) }))
      .toSorted((a, b) => a.gap - b.gap)
      .at(0)?.index ?? 0
  );
};

const chain = (ordered: readonly RouteStop[], pool: readonly RouteStop[]): readonly RouteStop[] =>
  branch(pool.length === 0)<readonly RouteStop[]>(
    () => ordered,
    () => {
      const index = nearestIndex(ordered, pool);
      const rest = [...pool.slice(0, index), ...pool.slice(index + 1)];
      return chain([...ordered, pool[index]!], rest);
    },
  );

/** Order a day's stops: timed ones in chronological order (the fixed
 *  constraints), then the untimed ones as a nearest-neighbour chain from the
 *  last placed point — so "whenever" stops still form a sensible path. */
export const orderDay = (stops: readonly RouteStop[]): readonly RouteStop[] =>
  chain(
    stops.filter(isTimed).toSorted((a, b) => startMinutes(a) - startMinutes(b)),
    stops.filter((stop) => !isTimed(stop)),
  );
