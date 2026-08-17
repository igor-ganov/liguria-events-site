import { GLOBAL_DAY_HOURS_KEY } from './global-day-hours-key.ts';
import { isDayHours } from './is-day-hours.ts';
import type { DayHours } from './day-hours-types.ts';

/** Remember a day window as the trip-wide default. A malformed window is not
 *  stored — a 0-or-1 array writes nothing rather than poisoning the default. */
export const writeGlobalDayHours = (hours: DayHours): void => {
  try {
    [hours]
      .filter(isDayHours)
      .forEach((valid) =>
        localStorage.setItem(GLOBAL_DAY_HOURS_KEY, JSON.stringify({ start: valid.start, end: valid.end })),
      );
  } catch {
    /* storage blocked — ignore */
  }
};
