import type { DayHours } from '../../lib/favorites/day-hours.ts';
import type { Payload } from './payload-types.ts';

/** This route's own day window, or undefined when it sets none (then the global
 *  setting, and finally the built-in default, applies). */
export const routeDayHours = (payload: Payload): DayHours | undefined =>
  [payload]
    .filter((p) => p.dayStart !== '' && p.dayEnd !== '')
    .map((p): DayHours => ({ start: p.dayStart, end: p.dayEnd }))
    .at(0);
