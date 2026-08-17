import { isDefined } from '../is-defined.ts';
import type { DateRange, RouteStop } from './route-types.ts';

// A stop belongs to the trip when its own span [s, e] overlaps [from, to].
const overlaps = (stop: RouteStop, range: DateRange): boolean =>
  (stop.e ?? stop.s) >= range.from && (range.to === undefined || stop.s <= range.to);

/** The stops a trip window keeps. Without a window nothing is dropped. */
export const stopsInRange = (
  stops: readonly RouteStop[],
  range: DateRange | undefined,
): readonly RouteStop[] =>
  [range].filter(isDefined).map((window) => stops.filter((stop) => overlaps(stop, window))).at(0) ??
  stops;
