import { dayMarkers } from './day-markers.ts';
import { stopOffset } from './stop-offset.ts';
import type { DayBase } from '../../lib/favorites/base-point.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { MarkerSpec } from './map-types.ts';

/** Every marker of the whole route, in day order, numbered across the trip. */
export const routeMarkers = (
  days: readonly RouteDay[],
  baseOf?: (day: string) => DayBase,
): readonly MarkerSpec[] =>
  days.flatMap((day, i) => dayMarkers(day, stopOffset(days, i), baseOf?.(day.day)));
