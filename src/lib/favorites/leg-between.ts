import { bothCoords } from './both-coords.ts';
import { haversineMeters } from '../geo/haversine-meters.ts';
import { isTight } from './is-tight.ts';
import { mapsDirUrl } from './maps-dir-url.ts';
import { minutesForMeters } from './minutes-for-meters.ts';
import type { Leg, Mode, RouteStop } from './route-types.ts';

/** The straight-line estimate between two consecutive stops: distance, travel
 *  minutes, a directions deep-link and whether it overshoots the next start.
 *  A stop without coordinates yields a 0 m leg with no link. */
export const legBetween = (from: RouteStop, to: RouteStop, mode: Mode): Leg => {
  const ends = bothCoords(from, to);
  const meters = ends.map(({ a, b }) => Math.round(haversineMeters(a, b))).at(0) ?? 0;
  const minutes = minutesForMeters(meters, mode);
  const mapsUrl = ends.map(({ a, b }) => mapsDirUrl(a, b, mode)).at(0) ?? '';
  return { meters, minutes, mapsUrl, tight: isTight(from, to, minutes) };
};
