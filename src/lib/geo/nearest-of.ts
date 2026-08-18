import { haversineMeters } from './haversine-meters.ts';
import type { LatLng } from './haversine-meters.ts';

/** Anything that can be measured against a point. */
export type Located = Readonly<{ lat: number; lng: number }>;

/** The item closest to a point, with the distance it sits at — a 0-or-1 array,
 *  so an empty list needs no guard at the call site. */
export const nearestOf = <T extends Located>(
  items: readonly T[],
  point: LatLng,
): readonly Readonly<{ item: T; meters: number }>[] =>
  [...items]
    .map((item) => ({ item, meters: haversineMeters(point, [item.lat, item.lng]) }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, 1);
