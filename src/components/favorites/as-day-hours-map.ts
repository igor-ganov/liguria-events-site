import { asTime } from './as-time.ts';
import { entriesOf } from './entries-of.ts';
import { fieldOf } from './field-of.ts';
import type { DayHours } from '../../lib/favorites/day-hours.ts';

/** Stored per-day window overrides; a day missing either end is dropped. */
export const asDayHoursMap = (raw: unknown): Readonly<Record<string, DayHours>> =>
  Object.fromEntries(
    entriesOf(raw)
      .map(([day, hours]): readonly [string, DayHours] => [
        day,
        { start: asTime(fieldOf(hours, 'start')), end: asTime(fieldOf(hours, 'end')) },
      ])
      .filter(([, hours]) => hours.start !== '' && hours.end !== ''),
  );
