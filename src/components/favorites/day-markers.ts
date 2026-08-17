import { isDefined } from '../../lib/is-defined.ts';
import type { Point } from '../../lib/favorites/base-point.ts';
import type { DayBase } from '../../lib/favorites/base-point.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { MarkerSpec, PinKind } from './map-types.ts';

const pin = (kind: PinKind) => (p: Point): MarkerSpec => ({ kind, at: [p.lng, p.lat], n: 0, tight: false });

// Every stop takes a number, placed or not, so the itinerary numbering and the
// map pins agree; only the placed ones get a marker.
const stopPins = (day: RouteDay, offset: number): readonly MarkerSpec[] =>
  day.stops.flatMap((stop, i) =>
    [stop.g].filter(isDefined).map(
      (g): MarkerSpec => ({ kind: 'stop', at: [g[1], g[0]], n: offset + i + 1, tight: day.legs[i - 1]?.tight === true }),
    ),
  );

/** Every marker a day contributes: its located stops, then the base and the
 *  optional distinct final point. */
export const dayMarkers = (day: RouteDay, offset: number, db: DayBase | undefined): readonly MarkerSpec[] => [
  ...stopPins(day, offset),
  ...[db?.base].filter(isDefined).map(pin('base')),
  ...[db?.final].filter(isDefined).map(pin('final')),
];
