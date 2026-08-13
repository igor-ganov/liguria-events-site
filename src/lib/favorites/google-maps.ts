import type { Mode, RouteDay } from './build-route.ts';
import type { DayBase } from './base-point.ts';

const asLatLng = (g: readonly [number, number] | undefined): string | undefined =>
  g === undefined ? undefined : `${g[0]},${g[1]}`;

/** A Google Maps directions URL through the day's located stops (the base and
 *  final point are included when set): origin → waypoints → destination, in the
 *  route's travel mode. Undefined when fewer than two points carry coordinates —
 *  Google needs at least two to draw a route. Google caps a URL at 9 waypoints,
 *  so a very long day is trimmed to its first ten located points. */
export const googleMapsUrl = (day: RouteDay, mode: Mode, db?: DayBase): string | undefined => {
  const pts: string[] = [];
  if (db?.base) pts.push(`${db.base.lat},${db.base.lng}`);
  for (const stop of day.stops) {
    const p = asLatLng(stop.g);
    if (p !== undefined) pts.push(p);
  }
  const end = db?.final ?? db?.base;
  if (end !== undefined && day.stops.length > 0) pts.push(`${end.lat},${end.lng}`);
  const uniq = pts.filter((p, i) => p !== pts[i - 1]);
  if (uniq.length < 2) return undefined;
  const params = new URLSearchParams({ api: '1', travelmode: mode, origin: uniq[0]!, destination: uniq.at(-1)! });
  const waypoints = uniq.slice(1, -1).slice(0, 9);
  if (waypoints.length > 0) params.set('waypoints', waypoints.join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};
