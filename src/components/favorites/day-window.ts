import { minutesOfTime } from '../../lib/favorites/day-schedule.ts';
import type { DayHours } from '../../lib/favorites/day-hours.ts';

const DEFAULT_START = 9 * 60;
const DEFAULT_END = 22 * 60;

/** A day's window as minutes since midnight, with the built-in 09:00–22:00 as
 *  the fallback for an unparseable clock time. */
export const dayWindow = (hours: DayHours): Readonly<{ startMin: number; endMin: number }> => ({
  startMin: minutesOfTime(hours.start) ?? DEFAULT_START,
  endMin: minutesOfTime(hours.end) ?? DEFAULT_END,
});
