import { routeDayHours } from './route-day-hours.ts';
import { effectiveDayHours, readGlobalDayHours } from '../../lib/favorites/day-hours.ts';
import type { DayHours } from '../../lib/favorites/day-hours.ts';
import type { Payload } from './payload-types.ts';

/** A day's effective window: per-day override → this route's setting → the
 *  visitor's global default → the built-in. */
export const timelineHours = (day: string, payload: Payload): DayHours =>
  effectiveDayHours(day, payload.dayHours, routeDayHours(payload), readGlobalDayHours());
