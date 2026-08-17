import type { DayHours } from './day-hours-types.ts';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Whether untrusted data carries a usable day window: both ends present and
 *  each a 24-hour "HH:MM". */
export const isDayHours = (value: unknown): value is DayHours =>
  Boolean(value) &&
  typeof value === 'object' &&
  TIME_RE.test(String(Reflect.get(Object(value), 'start'))) &&
  TIME_RE.test(String(Reflect.get(Object(value), 'end')));
