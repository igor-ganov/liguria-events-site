import { DEFAULT_DAY_HOURS } from './default-day-hours.ts';
import type { DayHours } from './day-hours-types.ts';

/** The day window in force: the per-day override, else this route's setting,
 *  else the trip-wide default, else the built-in. */
export const effectiveDayHours = (
  day: string,
  perDay: Readonly<Record<string, DayHours>>,
  route: DayHours | undefined,
  global: DayHours | undefined,
): DayHours => perDay[day] ?? route ?? global ?? DEFAULT_DAY_HOURS;
