import { isDefined } from '../is-defined.ts';
import type { Mode, RouteDay } from './build-route.ts';
import type { DayBase, Point } from './base-point.ts';

const MAX_WAYPOINTS = 9;
const MIN_POINTS = 2;

const asLatLng = (g: readonly [number, number] | undefined): string | undefined =>
  [g]
    .filter(isDefined)
    .map((coords) => `${coords[0]},${coords[1]}`)
    .at(0);

const pointLatLng = (point: Point): string => `${point.lat},${point.lng}`;

// Google caps a URL at 9 waypoints, so a very long day is trimmed to its first
// ten located points. A 0-or-1 array keeps the parameter absent when there are
// no intermediate stops at all.
const dirUrl = (points: readonly string[], mode: Mode): string => {
  const params = new URLSearchParams({
    api: '1',
    travelmode: mode,
    origin: points[0] ?? '',
    destination: points.at(-1) ?? '',
  });
  [points.slice(1, -1).slice(0, MAX_WAYPOINTS)]
    .filter((waypoints) => waypoints.length > 0)
    .forEach((waypoints) => params.set('waypoints', waypoints.join('|')));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

/** A Google Maps directions URL through the day's located stops (the base and
 *  final point are included when set): origin → waypoints → destination, in the
 *  route's travel mode. Undefined when fewer than two points carry coordinates —
 *  Google needs at least two to draw a route. */
export const googleMapsUrl = (day: RouteDay, mode: Mode, db?: DayBase): string | undefined => {
  const start = [db?.base].filter(isDefined).map(pointLatLng);
  const stops = day.stops.map((stop) => asLatLng(stop.g)).filter(isDefined);
  const end = [db?.final ?? db?.base]
    .filter(isDefined)
    .filter(() => day.stops.length > 0)
    .map(pointLatLng);
  const uniq = [...start, ...stops, ...end].filter((p, i, all) => p !== all[i - 1]);
  return [uniq]
    .filter((points) => points.length >= MIN_POINTS)
    .map((points) => dirUrl(points, mode))
    .at(0);
};
