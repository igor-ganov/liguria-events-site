import { branch } from '../../lib/branch.ts';
import { omitKey } from './omit-key.ts';
import type { DayHours } from '../../lib/favorites/day-hours.ts';

type PerDay = Readonly<Record<string, DayHours>>;

/** Set (or drop) a per-day window override. Both ends are needed: a half-filled
 *  pair clears the override rather than storing a broken window. */
export const nextDayHours = (hours: PerDay, day: string, start: string, end: string): PerDay =>
  branch(start !== '' && end !== '')<PerDay>(
    () => ({ ...hours, [day]: { start, end } }),
    () => omitKey(hours, day),
  );
