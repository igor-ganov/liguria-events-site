import { isDefined } from '../../lib/is-defined.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { Line } from './map-types.ts';

// The real routed geometry of the leg leading INTO stop i, when it carries one.
// There is no leg before the first stop, so it always falls back to the point.
const routed = (day: RouteDay, i: number): Line | undefined =>
  [day.legs[i - 1]?.geometry].filter(isDefined).filter((geometry) => geometry.length > 1).at(0);

// stop.g is [lat, lng]; the drawn line (like leg geometry) is [lng, lat].
const own = (day: RouteDay, i: number): Line =>
  [day.stops[i]?.g].filter(isDefined).map((g): readonly [number, number] => [g[1], g[0]]);

/** A day's drawn path: real routed geometry between stops where a leg carries
 *  it, else the straight segment between the two stop points. */
export const dayLine = (day: RouteDay): Line =>
  day.stops.flatMap((_, i) => routed(day, i) ?? own(day, i));
