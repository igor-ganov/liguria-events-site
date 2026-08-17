import type { Point } from './point-types.ts';

/** The base in force on a day: the per-day override, else this route's setting,
 *  else the trip-wide default. */
export const effectiveBase = (
  day: string,
  perDay: Readonly<Record<string, Point>>,
  route: Point | undefined,
  global: Point | undefined,
): Point | undefined => perDay[day] ?? route ?? global;
